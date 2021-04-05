import * as PIXI from "pixi.js";
import io from "socket.io-client";
import Card, { Suit, Value } from "./Card";

const app = new PIXI.Application();
const socket = io();

document.body.appendChild(app.view);

Object.values(Value).forEach((value) => {
  Object.values(Suit).forEach((suit) => {
    app.stage.addChild(new Card(value, suit));
  });
});
