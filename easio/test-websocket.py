#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from tornado.web import RequestHandler, Application, asynchronous, StaticFileHandler
from tornado.httpserver import HTTPServer
from tornado.websocket import WebSocketHandler
from tornado.ioloop import IOLoop
from json import loads, dumps


class Client(object):

    def __init__(self, manager, sessid, handler=None):
        self.online = True
        self.manager = manager
        self.sessid = sessid
        if handler:
            self.handlers = [handler]
        else:
            self.handlers = []
        self.outbox = []
        self.inbox = []
        self.manager.clients[sessid] = self
        print("New connection", sessid)

    def onMessage(self, message):
        self.inbox.append(message)

    def send(self, message):
        if self.handlers:
            self.handlers[0].send(message)
        else:
            self.outbox.append(message)

    def register(self, handler=None):
        self.online = True
        if not handler:
            return
        if handler in self.handlers:
            return
        self.handlers.append(handler)

    def unregister(self, handler=None):
        self.online = False
        print("Connection offline", self.sessid)
        if handler:
            self.handlers = [h for h in self.handlers if h != handler]


class Server(object):

    # Define as a singleton
    instance = None

    def __new__(cls):
        if cls.instance is None:
            cls.instance = object.__new__(cls)
        return cls.instance

    clients = {}

    def register(self, sessid, handler=None):
        client = self.clients.get(sessid)
        if not client:
            return Client(self, sessid, handler)
        client.register(handler)

    def unregister(self, sessid, handler=None):
        client = self.clients.get(sessid)
        if client:
            client.unregister(handler)

    def outbox(self, sessid):
        client = self.clients.get(sessid)
        if not client:
            client = self.register(sessid)
        result = client.outbox[:]
        client.outbox = []
        return result

    def onMessage(self, sessid, method, message):
        client = self.clients.get(sessid)
        if not client:
            client = self.register(sessid)
        client.onMessage(message)
        print("New", method, "message from", sessid, ">", repr(message))

    def send(self, sessid, message):
        client = self.clients.get(sessid)
        if not client:
            client = self.register(sessid)
        client.send(message)


class AjaxHandler(RequestHandler):

    @asynchronous
    def get(self):
        print("GET")
        self.parse("GET")

    @asynchronous
    def post(self):
        self.parse("POST", loads(str(self.request.body, encoding='utf-8')))

    @asynchronous
    def parse(self, method, rows=[]):
        server = Server.instance
        sessid = self.request.headers.get("AjaxWS-ID")
        server.register(sessid)
        for message in rows:
            if isinstance(message, dict):
                if message.get("method") == "close":
                    server.unregister(sessid)
                    self.finish()
                    return
            if isinstance(message, str) and message.startswith("SESSID="):
                continue
            server.onMessage(sessid, method, message)
        self.set_header("Content-type", "application/json; charset=UTF-8")
        self.set_header("Access-Control-Allow-Origin", "*")
        outbox = server.outbox(sessid)
        if outbox:
            self.write(dumps(outbox))
        self.finish()


class WSandler(WebSocketHandler):

    def open(self):
        self.sessid = None

    def on_message(self, message):
        if message.startswith("SESSID="):
            self.sessid = "=".join(message.split("=")[1:])
            Server.instance.register(self.sessid, self)
        elif self.sessid:
            Server.instance.onMessage(self.sessid, "WS", message)
        else:
            print("Ignoring message", message)

    def on_close(self):
        if self.sessid:
            Server.instance.unregister(self.sessid, self)


if __name__ == "__main__":
    Server()
    HTTPapp = Application([
        (r'/ajaxws', AjaxHandler),
        (r'/ws', WSandler),
        (r"/static/(.*)", StaticFileHandler, {"path": "www", "default_filename": "test.html"}),
        ], debug=True)
    HTTPservice = HTTPServer(HTTPapp)
    HTTPservice.listen(8585)
    IOLoop.instance().start()
