import * as PIXI from "pixi.js";
import Button from "../Button";
import Card from "../Card";
import Color from "../Color";
import Text from "../Text";
import Application from "../Application";
import ViewController from "./ViewController";
import Sound from "../Sound";
import { CardJson, CardValueUtil } from "../../common/Card";
import { TycoonOptions, SocketInitSuccessData } from "../../common/Tycoon";
import LobbyViewController from "./LobbyViewController";
import HostRoomViewController from "./HostRoomViewController";
import Alert from "../Alert";
import Tycoon from "../Tycoon";
import anime from "animejs";
import Container from "../Container";
import Speech from "../Speech";

class PlayerView extends Container {
  private static readonly WIDTH = 128;
  private static readonly HEIGHT = 128;

  private numCardsLeft: number;

  private frame: PIXI.Graphics;
  private playerNameText: Text;
  private numCardsLeftText: Text;
  private turnIndicator: Text;

  constructor(playerName: string) {
    super();
    this.numCardsLeft = 0;
    this.frame = this.createFrame();
    this.playerNameText = new Text(playerName, {
      fill: Color.WHITE,
      fontSize: 16,
    });
    this.numCardsLeftText = new Text("", {
      fill: Color.WHITE,
      fontSize: 12,
    });
    this.turnIndicator = new Text("🂠", { fill: Color.WHITE });
    this.layout();
    this.draw();
  }

  private layout() {
    this.layoutNameText();
    this.layoutNumCardsLeftText();
    this.layoutTurnIndicator();
  }

  private layoutTurnIndicator() {
    this.turnIndicator.anchor.set(0.5);
    this.turnIndicator.x = PlayerView.WIDTH / 2;
    this.turnIndicator.y =
      PlayerView.HEIGHT -
      this.turnIndicator.height / 2 -
      Application.spacing(1);
    anime({
      targets: this.turnIndicator,
      rotation: Math.PI * 2,
      loop: true,
      easing: "easeInOutSine",
      duration: 1200,
    });
  }

  private layoutNumCardsLeftText() {
    this.numCardsLeftText.anchor.set(0.5);
    this.numCardsLeftText.x = PlayerView.WIDTH / 2;
    this.numCardsLeftText.y =
      this.playerNameText.y +
      this.playerNameText.height / 2 +
      this.numCardsLeftText.height / 2 +
      Application.spacing(1);
  }

  private layoutNameText() {
    this.playerNameText.anchor.set(0.5);
    this.playerNameText.x = PlayerView.WIDTH / 2;
    this.playerNameText.y =
      this.playerNameText.height / 2 + Application.spacing(1);
  }

  private draw() {
    this.addChild(this.frame);
    this.addChild(this.playerNameText);
    this.addChild(this.numCardsLeftText);
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.WHITE);
    frame.drawRect(0, 0, PlayerView.WIDTH, PlayerView.HEIGHT);
    return frame;
  }

  public addTurnIndicator() {
    this.addChild(this.turnIndicator);
  }

  public removeTurnIndicator() {
    this.removeChild(this.turnIndicator);
  }

  public setNumCardsLeft(numCardsLeft: number) {
    this.numCardsLeft = numCardsLeft;
    this.numCardsLeftText.text = `Cards Left: ${numCardsLeft}`;
  }

  public getNumCardsLeft() {
    return this.numCardsLeft;
  }
}

class TycoonViewController extends ViewController {
  private static readonly CARD_SELECTION_OFFSET_Y = 20;

  private tycoon: Tycoon;

  private myCards: Card[];
  private playedCards: Card[][];
  private actionButton: Button;
  private hostLeftRoomAlert: Alert;
  private guestLeftRoomAlert: Alert;
  private gameOverAlert: Alert;
  private myView: PlayerView;
  private theirView: PlayerView;
  private theirSpeech: Speech;

  private trashText: Text;

  constructor(tycoonOptions: TycoonOptions) {
    super();

    this.tycoon = new Tycoon(tycoonOptions);
    this.myCards = [];
    this.playedCards = [];
    this.actionButton = this.createActionButton();
    this.hostLeftRoomAlert = this.createHostLeftRoomAlert();
    this.guestLeftRoomAlert = new Alert("The guest left the game :(");
    this.gameOverAlert = this.createGameOverAlert();
    this.myView = new PlayerView("You");
    this.theirView = new PlayerView("Them");
    this.trashText = new Text("🗑", { fill: Color.WHITE, fontSize: 64 });
    this.theirSpeech = new Speech("Pass");
    this.enableInteraction();
  }

  private enableInteraction() {
    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(
      0,
      0,
      Application.WIDTH,
      Application.HEIGHT
    );
  }

  private createGameOverAlert() {
    const alert = new Alert("Game Over");
    alert.onOkButtonPointerDown(() => {
      this.popViewController();
    });
    return alert;
  }

  private createActionButton() {
    const button = new Button("Pass 🤷");
    button.disable();
    button.onPointerDown(this.handleActionButtonPointerDown);
    return button;
  }

  protected layout() {
    this.layoutActionButton();
    this.layoutMyView();
    this.layoutTheirView();
    this.layoutTrashText();
    this.layoutTheirSpeech();
  }

  private layoutTheirSpeech() {
    this.theirSpeech.setCenterAsOrigin();
    this.theirSpeech.x =
      this.theirView.x +
      this.theirView.width / 2 +
      this.theirSpeech.width / 2 +
      Application.spacing(2);
    this.theirSpeech.y = this.theirSpeech.height / 2 + Application.spacing(2);
  }

  private layoutTrashText() {
    this.trashText.anchor.set(0.5);
    this.trashText.x = this.trashText.width / 2 + Application.spacing(2);
    this.trashText.y = Application.HEIGHT / 2;
  }

  private layoutMyView() {
    this.myView.x = Application.spacing(2);
    this.myView.y =
      Application.HEIGHT - this.myView.height - Application.spacing(2);
  }

  private layoutTheirView() {
    this.theirView.setCenterAsOrigin();
    this.theirView.x = Application.WIDTH / 2;
    this.theirView.y = this.theirView.height / 2 + Application.spacing(2);
  }

  private layoutActionButton() {
    this.actionButton.x =
      Application.WIDTH - this.actionButton.width - Application.spacing(2);
    this.actionButton.y =
      Application.HEIGHT - this.actionButton.height - Application.spacing(2);
  }

  protected addEventListeners() {
    this.on("pointerdown", this.handlePointerDown);

    const socket = Application.shared.socket;
    socket.on("init-success", this.handleSocketInitSuccess.bind(this));
    socket.on("update", this.handleSocketUpdate.bind(this));
    socket.on("lose", this.handleSocketLose.bind(this));
    socket.on("host-left", this.handleHostLeft.bind(this));
    socket.on("guest-left", this.handleGuestLeft.bind(this));

    socket.emit("init");
  }

  private createHostLeftRoomAlert() {
    const alert = new Alert("The host left the game :(");
    alert.onOkButtonPointerDown(this.handleHostLeftRoomAlertOk);
    return alert;
  }

  private handleHostLeftRoomAlertOk = () => {
    this.loadViewController(new LobbyViewController());
  };

  private handleHostLeft() {
    this.addChild(this.hostLeftRoomAlert);
  }

  private handleGuestLeft(roomId: string) {
    this.guestLeftRoomAlert.onOkButtonPointerDown(() => {
      this.loadViewController(new HostRoomViewController(roomId));
    });
    this.addChild(this.guestLeftRoomAlert);
  }

  private handleSocketInitSuccess(data: SocketInitSuccessData) {
    const { cardJsons, myTurn } = data;
    this.tycoon.init(myTurn);
    this.myCards = this.createMyCardsFromCardJsons(cardJsons);
    this.sortMyCards();
    this.drawMyCards();
    this.addChild(this.actionButton);
    this.update();
    this.theirView.setNumCardsLeft(16);
  }

  private update() {
    this.layoutMyCards();
    this.updatePlayerViews();
    this.updateActionButton();
    this.updateMyCardsInteraction();
    this.myView.setNumCardsLeft(this.myCards.length);
  }

  private createMyCardsFromCardJsons(jsons: CardJson[]) {
    return jsons.map((json) => {
      const card = Card.fromJson(json);
      card.setCenterAsOrigin();
      card.onSelect((selected: boolean) => {
        card.y +=
          TycoonViewController.CARD_SELECTION_OFFSET_Y * (selected ? -1 : 1);
        Sound.play("cardSlide1.ogg");
      });
      return card;
    });
  }

  private sortMyCards() {
    this.myCards.sort((a, b) => {
      const aValue = a.getValue();
      const bValue = b.getValue();
      if (aValue === bValue) return 0;
      if (CardValueUtil.greaterThan(aValue, bValue)) return 1;
      return -1;
    });
  }

  protected removeEventListeners() {
    this.off("pointerdown", this.handlePointerDown);

    const socket = Application.shared.socket;
    socket.off("init-success");
    socket.off("update");
    socket.off("lose");
    socket.off("host-left");
    socket.off("guest-left");
  }

  private handleActionButtonPointerDown = () => {
    const selectedCards = this.getSelectedCards();
    this.tycoon.play(selectedCards);

    const socket = Application.shared.socket;
    const selectedCardJsons = selectedCards.map((card) => card.toJson());
    socket.emit("action", selectedCardJsons);

    this.myCards = this.getUnselectedCards();

    const isPass = selectedCards.length === 0;
    if (isPass) {
      this.removePlayedCardsWithAnimation();
    } else {
      this.playedCards.push(selectedCards);
      selectedCards.forEach((card) => {
        this.removeChild(card);
        this.addChild(card);
        card.disableSelection();
      });
      this.layoutSelectedCardsWithAnimation(selectedCards);

      if (this.tycoon.getPrevCards().length === 0) {
        this.playedCards.forEach((cards) => this.removeChild(...cards));
        this.removeChild(...selectedCards);
        this.playedCards = [];
      }
    }

    Sound.play("cardPlace1.ogg");

    if (this.myCards.length === 0) {
      const socket = Application.shared.socket;
      socket.emit("win");
      this.addChild(this.gameOverAlert);
    }

    this.update();
  };

  private removePlayedCardsWithAnimation() {
    this.playedCards.forEach((cards) => {
      cards.forEach((card) => {
        anime({
          targets: card,
          x: this.trashText.x,
          rotation: Math.random() * Math.PI * 2,
          easing: "easeOutQuad",
          complete: () => this.removeChild(card),
        });
      });
    });
    this.playedCards = [];
  }

  private layoutSelectedCardsWithAnimation(cards: Card[]) {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      anime({
        targets: card,
        x:
          Application.WIDTH / 2 -
          (Application.spacing(2) * (cards.length - 1)) / 2 +
          Application.spacing(2) * i,
        y: Application.HEIGHT / 2,
        rotation: Math.random() * Math.PI * 2,
        easing: "easeOutQuad",
      });
    }
  }

  private handleSocketLose() {
    this.addChild(this.gameOverAlert);
  }

  private handleSocketUpdate(lastCardJsons: CardJson[]) {
    const theirSelectedCards = lastCardJsons.map((json) => {
      const card = Card.fromJson(json);
      card.setCenterAsOrigin();
      card.x = this.theirView.x;
      card.y = this.theirView.y;
      return card;
    });

    this.tycoon.play(theirSelectedCards);

    const isPass = theirSelectedCards.length === 0;
    if (isPass) {
      this.removePlayedCardsWithAnimation();
      this.showTheirSpeechWithAnimation(() => {
        this.removeChild(this.theirSpeech);
      });
    } else {
      this.theirView.setNumCardsLeft(
        this.theirView.getNumCardsLeft() - theirSelectedCards.length
      );

      if (this.tycoon.getPrevCards().length === 0) {
        this.playedCards.forEach((cards) => this.removeChild(...cards));
        this.playedCards = [];
      } else {
        this.addChild(...theirSelectedCards);
        this.layoutSelectedCardsWithAnimation(theirSelectedCards);
        this.playedCards.push(theirSelectedCards);
        Sound.play("cardPlace1.ogg");
      }
    }

    this.update();
  }

  private showTheirSpeechWithAnimation(onComplete: () => void) {
    this.addChild(this.theirSpeech);

    const obj = {
      scale: 0,
    };
    this.theirSpeech.scale.set(0);
    anime({
      targets: obj,
      scale: 1,
      update: () => {
        this.theirSpeech.scale.set(obj.scale);
      },
      complete: onComplete,
    });
  }

  private updateMyCardsInteraction() {
    if (this.tycoon.isMyTurn()) {
      this.enableMyCardsInteraction();
    } else {
      this.disableMyCardsInteraction();
    }
  }

  private updatePlayerViews() {
    if (this.tycoon.isMyTurn()) {
      this.myView.addTurnIndicator();
      this.theirView.removeTurnIndicator();
    } else {
      this.myView.removeTurnIndicator();
      this.theirView.addTurnIndicator();
    }
  }

  private updateActionButton() {
    if (this.tycoon.isMyTurn()) {
      if (this.tycoon.validateNextCards(this.getSelectedCards())) {
        this.actionButton.enable();
        if (this.getSelectedCards().length === 0) {
          this.actionButton.updateText("Pass 🤷");
        } else {
          this.actionButton.updateText("Play 🤌");
        }
      } else {
        this.actionButton.disable();
      }
    } else {
      this.actionButton.disable();
    }
  }

  private getSelectedCards() {
    return this.myCards.filter((card) => card.isSelected());
  }

  private getUnselectedCards() {
    return this.myCards.filter((card) => !card.isSelected());
  }

  private handlePointerDown = () => {
    if (!this.tycoon.isMyTurn()) return;
    this.updateActionButton();
  };

  protected draw() {
    this.addChild(this.myView);
    this.addChild(this.theirView);
    this.addChild(this.trashText);
  }

  private drawMyCards() {
    this.addChild(...this.myCards);
  }

  private layoutMyCards() {
    const circleRadius = 500;
    const circleCenterX = Application.WIDTH / 2;
    const circleCenterY = Application.HEIGHT + circleRadius - 100;

    this.myCards.forEach((card, index) => {
      const startRadian = (-Math.PI / 64) * (this.myCards.length / 2);
      const endRadian = -startRadian;
      const stepRadian = (endRadian - startRadian) / (this.myCards.length - 1);
      const rotationRadian = startRadian + stepRadian * index || 0;
      card.rotation = rotationRadian;
      card.x = circleCenterX + circleRadius * Math.sin(rotationRadian);
      card.y = circleCenterY - circleRadius * Math.cos(rotationRadian);
    });
  }

  private disableMyCardsInteraction() {
    this.myCards.forEach((card) => card.disableSelection());
  }

  private enableMyCardsInteraction() {
    this.myCards.forEach((card) => card.enableSelection());
  }
}

export default TycoonViewController;
