import * as PIXI from "pixi.js";
import Button from "../Button";
import Card from "../Card";
import Color from "../Color";
import Text from "../Text";
import TycoonValidator from "../TycoonValidator";
import Application from "../Application";
import ViewController from "./ViewController";
import Sound from "../Sound";
import { CardJson, CardValueUtil } from "../../Common/Card";
import {
  DEFAULT_TYCOON_STATE,
  TycoonOptions,
  TycoonState,
} from "../../Common/Tycoon";
import LobbyViewController from "./LobbyViewController";
import HostRoomViewController from "./HostRoomViewController";
import Alert from "../Alert";

class TycoonViewController extends ViewController {
  private myCards: Card[];
  private playedCards: Card[][];

  private isMyTurn: boolean;
  private tycoonValidator: TycoonValidator;
  private tycoonState: TycoonState;

  private promptText: Text;
  private actionButton: Button;

  private hostLeftRoomAlert: Alert;
  private guestLeftRoomAlert: Alert;

  constructor(tycoonOptions: TycoonOptions) {
    super();

    this.isMyTurn = false;
    this.myCards = [];
    this.playedCards = [];
    this.tycoonValidator = new TycoonValidator(tycoonOptions);
    this.tycoonState = DEFAULT_TYCOON_STATE;
    this.promptText = new Text("", { fill: Color.WHITE });
    this.actionButton = this.createActionButton();
    this.hostLeftRoomAlert = new Alert("The host left the game :(");
    this.guestLeftRoomAlert = new Alert("The guest left the game :(");
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

  private createActionButton() {
    const button = new Button("pass");
    button.disable();
    button.onPointerDown(this.handleActionButtonPointerDown);
    return button;
  }

  protected layout() {
    this.layoutPromptText();
    this.layoutActionButton();
  }

  private layoutPromptText() {
    this.promptText.anchor.set(0.5);
    this.promptText.x = Application.WIDTH / 2;
    this.promptText.y = Application.spacing(5);
  }

  private layoutActionButton() {
    this.actionButton.setCenterAsOrigin();
    this.actionButton.x = Application.WIDTH / 2;
    this.actionButton.y = Application.HEIGHT / 2 + Application.spacing(10);
  }

  protected addEventListeners() {
    this.on("pointerdown", this.handlePointerDown);

    const socket = Application.shared.socket;
    socket.on("init-success", this.handleSocketInitSuccess);
    socket.on("update", this.handleSocketUpdate);
    socket.on("lose", this.handleSocketLose);
    socket.on("host-left-game", this.handleHostLeftGame);
    socket.on("guest-left-game", this.handleGuestLeftGame);

    socket.emit("init");
  }

  private handleHostLeftGame = () => {
    this.hostLeftRoomAlert.onOkButtonPointerDown(() => {
      this.loadViewController(new LobbyViewController());
    });
    this.addChild(this.hostLeftRoomAlert);
  };

  private handleGuestLeftGame = (roomId: string) => {
    this.guestLeftRoomAlert.onOkButtonPointerDown(() => {
      this.loadViewController(new HostRoomViewController(roomId));
    });
    this.addChild(this.guestLeftRoomAlert);
  };

  private handleSocketInitSuccess = (data: {
    cardJsons: CardJson[];
    isMyTurn: boolean;
  }) => {
    const { cardJsons, isMyTurn } = data;
    this.isMyTurn = isMyTurn;
    this.myCards = cardJsons.map((json) => Card.fromJson(json));
    this.myCards.forEach((card) => {
      card.setCenterAsOrigin();
      card.onSelect((selected: boolean) => {
        card.y += 20 * (selected ? -1 : 1);
        Sound.play("cardSlide1.ogg");
      });
    });
    this.myCards.sort((a, b) => {
      const aValue = a.getValue();
      const bValue = b.getValue();
      if (aValue === bValue) return 0;
      if (CardValueUtil.greaterThan(aValue, bValue)) return 1;
      return -1;
    });
    this.drawMyCards();
    this.layoutMyCards();
    this.updatePromptTextBasedOnMyTurn();
    this.updateActionButton();

    if (!this.isMyTurn) {
      this.disableMyCardsInteraction();
    }
  };

  protected removeEventListeners() {
    this.off("pointerdown", this.handlePointerDown);

    const socket = Application.shared.socket;
    socket.off("init", this.handleSocketInitSuccess);
    socket.off("update", this.handleSocketUpdate);
    socket.off("lose", this.handleSocketLose);
    socket.off("host-left-game", this.handleHostLeftGame);
    socket.off("guest-left-game", this.handleGuestLeftGame);
  }

  private handleActionButtonPointerDown = () => {
    const selectedCards = this.myCards.filter((card) => card.isSelected());
    const selectedCardJsons = selectedCards.map((card) => card.toJson());

    const socket = Application.shared.socket;
    socket.emit("action", selectedCardJsons);

    this.myCards = this.myCards.filter((card) => !card.isSelected());
    this.layoutMyCards();

    const isPass = selectedCards.length === 0;
    if (isPass) {
      this.playedCards.forEach((cards) => this.removeChild(...cards));
      this.playedCards = [];
    } else {
      this.playedCards.push(selectedCards);
      selectedCards.forEach((card) => {
        this.removeChild(card);
        this.addChild(card);
        card.disableSelection();
      });
      this.layoutSelectedCards(selectedCards);
    }

    this.isMyTurn = false;
    this.disableMyCardsInteraction();
    this.updatePromptTextBasedOnMyTurn();
    this.updateActionButton();

    Sound.play("cardPlace1.ogg");

    if (this.myCards.length === 0) {
      const socket = Application.shared.socket;
      socket.emit("win");
      this.promptText.text = "You Won!";
    }
  };

  private layoutSelectedCards(cards: Card[]) {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      card.rotation = Math.random() * Math.PI * 2;
      card.x = Application.WIDTH / 2 + i * 30;
      card.y = Application.HEIGHT / 2 - card.height / 2;
    }
  }

  private handleSocketLose = () => {
    this.disableMyCardsInteraction();
    this.actionButton.disable();
    this.promptText.text = "You lost";
  };

  private handleSocketUpdate = (lastCardJsons: CardJson[]) => {
    const theirSelectedCards = lastCardJsons.map((json) => Card.fromJson(json));
    theirSelectedCards.forEach((card) => (card.interactive = false));
    if (theirSelectedCards.length === 0) {
      this.playedCards.forEach((cards) => this.removeChild(...cards));
      this.playedCards = [];
    } else {
      this.addChild(...theirSelectedCards);
      this.layoutSelectedCards(theirSelectedCards);
      this.playedCards.push(theirSelectedCards);
      Sound.play("cardPlace1.ogg");
    }

    this.isMyTurn = true;
    this.enableMyCardsInteraction();
    this.updatePromptTextBasedOnMyTurn();
    this.updateActionButton();
  };

  private updatePromptTextBasedOnMyTurn() {
    if (this.isMyTurn) {
      this.promptText.text = "Your Turn 🙌";
    } else {
      this.promptText.text = "Their Turn　🤔🤔🤔";
    }
  }

  private updateActionButton() {
    if (this.isMyTurn) {
      if (this.isCardSelectionValid()) {
        this.actionButton.enable();
        if (this.getSelectedCards().length === 0) {
          this.actionButton.updateText("pass");
        } else {
          this.actionButton.updateText("play");
        }
      } else {
        this.actionButton.disable();
      }
    } else {
      this.actionButton.disable();
    }
  }

  private isCardSelectionValid() {
    const selectedCards = this.getSelectedCards();
    return this.tycoonValidator
      .withPrevCards(this.getPrevCards())
      .withState(this.tycoonState)
      .validateNextCards(selectedCards);
  }

  private getSelectedCards() {
    return this.myCards.filter((card) => card.isSelected());
  }

  private getPrevCards() {
    return this.playedCards[this.playedCards.length - 1] || [];
  }

  private handlePointerDown = () => {
    if (!this.isMyTurn) return;
    this.updateActionButton();
  };

  protected draw() {
    this.addChild(this.actionButton);
    this.addChild(this.promptText);
  }

  private drawMyCards() {
    this.addChild(...this.myCards);
  }

  private layoutMyCards() {
    const circleRadius = 700;
    const circleCenterX = Application.WIDTH / 2;
    const circleCenterY = Application.HEIGHT + circleRadius - 100;

    for (let i = 0; i < this.myCards.length; i++) {
      const card = this.myCards[i];
      const startRadian = (-Math.PI / 64) * (this.myCards.length / 2);
      const endRadian = -startRadian;
      const step = (endRadian - startRadian) / this.myCards.length;
      const radian = startRadian + step * i;
      card.rotation = radian;
      card.x = circleCenterX + circleRadius * Math.sin(radian);
      card.y = circleCenterY - circleRadius * Math.cos(radian);
    }
  }

  private disableMyCardsInteraction() {
    this.myCards.forEach((card) => card.disableSelection());
  }

  private enableMyCardsInteraction() {
    this.myCards.forEach((card) => card.enableSelection());
  }
}

export default TycoonViewController;
