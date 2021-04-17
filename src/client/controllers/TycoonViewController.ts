import * as PIXI from "pixi.js";
import Button from "../views/Button";
import Card from "../views/Card";
import Text from "../views/Text";
import Application from "../Application";
import ViewController from "./ViewController";
import Sound from "../Sound";
import { CardJson, CardValueUtil } from "../../common/Card";
import { TycoonOptions, SocketInitSuccessData } from "../../common/Tycoon";
import LobbyViewController from "./LobbyViewController";
import HostRoomViewController from "./HostRoomViewController";
import Alert from "../views/Alert";
import Tycoon from "../Tycoon";
import anime from "animejs";
import Speech from "../views/Speech";
import Layout from "../Layout";
import PlayerInfoView from "../views/PlayerInfoView";

class TycoonViewController extends ViewController {
  private static readonly CARD_SELECTION_OFFSET_Y = 20;

  private tycoon: Tycoon;
  private numTheirCards: number;

  private myCards: Card[];
  private playedCards: Card[][];
  private actionButton: Button;
  private hostLeftRoomAlert: Alert;
  private guestLeftRoomAlert: Alert;
  private gameOverAlert: Alert;
  private myInfoView: PlayerInfoView;
  private theirInfoView: PlayerInfoView;
  private theirPassSpeech: Speech;
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
    this.myInfoView = new PlayerInfoView("You");
    this.theirInfoView = new PlayerInfoView("Them");
    this.trashText = new Text("🗑", { fontSize: 64 });
    this.theirPassSpeech = new Speech("Pass");
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
    alert.onOk(() => this.popViewController());
    return alert;
  }

  private createActionButton() {
    const button = new Button("Pass 🤷");
    button.disable();
    button.onPointerDown(this.handleActionButtonPointerDown);
    return button;
  }

  protected layout() {
    super.layout();
    this.layoutActionButton();
    this.layoutMyView();
    this.layoutTheirView();
    this.layoutTrashText();
    this.layoutTheirSpeech();
  }

  private layoutTheirSpeech() {
    this.theirPassSpeech.setCenterAsOrigin();
    this.theirPassSpeech.x =
      this.theirInfoView.x +
      PlayerInfoView.WIDTH / 2 +
      this.theirPassSpeech.getSize().width / 2 +
      Layout.spacing(2);
    this.theirPassSpeech.y =
      this.theirPassSpeech.getSize().height / 2 + Layout.spacing(2);
  }

  private layoutTrashText() {
    this.trashText.setCenterAsOrigin();
    this.trashText.x =
      this.trashText.getTextSize().width / 2 + Layout.spacing(2);
    this.trashText.y = Application.HEIGHT / 2;
  }

  private layoutMyView() {
    this.myInfoView.x = Layout.spacing(2);
    this.myInfoView.y =
      Application.HEIGHT - PlayerInfoView.HEIGHT - Layout.spacing(2);
  }

  private layoutTheirView() {
    this.theirInfoView.setCenterAsOrigin();
    this.theirInfoView.x = Application.WIDTH / 2;
    this.theirInfoView.y = PlayerInfoView.HEIGHT / 2 + Layout.spacing(2);
  }

  private layoutActionButton() {
    this.actionButton.x =
      Application.WIDTH - this.actionButton.getSize().width - Layout.spacing(2);
    this.actionButton.y =
      Application.HEIGHT -
      this.actionButton.getSize().height -
      Layout.spacing(2);
  }

  public addEventListeners() {
    super.addEventListeners();

    this.on("pointerdown", this.handlePointerDown);

    const socket = Application.shared.socket;
    socket.on("tycoon-init-success", this.handleSocketInitSuccess);
    socket.on("tycoon-update", this.handleSocketUpdate);
    socket.on("tycoon-lose", this.handleSocketLose);
    socket.on("tycoon-host-leave", this.handleHostLeft);
    socket.on("tycoon-guest-leave", this.handleGuestLeft);

    socket.emit("tycoon-init");
  }

  private createHostLeftRoomAlert() {
    const alert = new Alert("The host left the game :(");
    alert.onOk(this.handleHostLeftRoomAlertOk);
    return alert;
  }

  private handleHostLeftRoomAlertOk = () => {
    this.loadViewController(new LobbyViewController());
  };

  private handleHostLeft = () => {
    this.addView(this.hostLeftRoomAlert);
  };

  private handleGuestLeft = (roomId: string) => {
    this.guestLeftRoomAlert.onOk(() => {
      this.loadViewController(new HostRoomViewController(roomId));
    });
    this.addView(this.guestLeftRoomAlert);
  };

  private handleSocketInitSuccess = (data: SocketInitSuccessData) => {
    const { cardJsons, myTurn } = data;
    this.tycoon.init(myTurn);
    this.myCards = this.createMyCardsFromCardJsons(cardJsons);
    this.numTheirCards = cardJsons.length;
    this.sortMyCards();
    this.drawMyCards();
    this.addView(this.actionButton);
    this.update();
  };

  private update() {
    this.layoutMyCards();
    this.updatePlayerInfoViews();
    this.updateActionButton();
    this.updateMyCardsInteraction();
    this.myInfoView.updateNumCardsLeftText(this.myCards.length);
    this.theirInfoView.updateNumCardsLeftText(this.numTheirCards);
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

  public removeEventListeners() {
    super.removeEventListeners();
    this.off("pointerdown", this.handlePointerDown);

    const socket = Application.shared.socket;
    socket.off("tycoon-init-success", this.handleSocketInitSuccess);
    socket.off("tycoon-update", this.handleSocketUpdate);
    socket.off("tycoon-lose", this.handleSocketLose);
    socket.off("tycoon-host-leave", this.handleHostLeft);
    socket.off("tycoon-guest-leave", this.handleGuestLeft);
  }

  private handleActionButtonPointerDown = () => {
    const selectedCards = this.getSelectedCards();
    this.tycoon.play(selectedCards);

    const socket = Application.shared.socket;
    const selectedCardJsons = selectedCards.map((card) => card.toJson());
    socket.emit("tycoon-action", selectedCardJsons);

    this.myCards = this.getUnselectedCards();

    const isPass = selectedCards.length === 0;
    if (isPass) {
      this.removePlayedCardsWithAnimation();
    } else {
      this.playedCards.push(selectedCards);
      selectedCards.forEach((card) => {
        this.removeView(card);
        this.addView(card);
        card.disableSelection();
      });
      this.layoutSelectedCardsWithAnimation(selectedCards);

      if (this.tycoon.getPrevCards().length === 0) {
        this.playedCards.forEach((cards) => this.removeViews(...cards));
        this.removeViews(...selectedCards);
        this.playedCards = [];
      }
    }

    Sound.play("cardPlace1.ogg");

    if (this.myCards.length === 0) {
      const socket = Application.shared.socket;
      socket.emit("tycoon-win");
      this.addView(this.gameOverAlert);
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
          complete: () => this.removeView(card),
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
          (Layout.spacing(2) * (cards.length - 1)) / 2 +
          Layout.spacing(2) * i,
        y: Application.HEIGHT / 2,
        rotation: Math.random() * Math.PI * 2,
        easing: "easeOutQuad",
      });
    }
  }

  private handleSocketLose = () => {
    this.addView(this.gameOverAlert);
  };

  private handleSocketUpdate = (lastCardJsons: CardJson[]) => {
    const theirSelectedCards = lastCardJsons.map((json) => {
      const card = Card.fromJson(json);
      card.setCenterAsOrigin();
      card.x = this.theirInfoView.x;
      card.y = this.theirInfoView.y;
      return card;
    });

    this.tycoon.play(theirSelectedCards);
    this.numTheirCards -= theirSelectedCards.length;

    const isPass = theirSelectedCards.length === 0;
    if (isPass) {
      this.removePlayedCardsWithAnimation();
      this.showTheirSpeechWithAnimation(() => {
        this.removeView(this.theirPassSpeech);
      });
    } else {
      if (this.tycoon.getPrevCards().length === 0) {
        this.playedCards.forEach((cards) => this.removeViews(...cards));
        this.playedCards = [];
      } else {
        this.addViews(...theirSelectedCards);
        this.layoutSelectedCardsWithAnimation(theirSelectedCards);
        this.playedCards.push(theirSelectedCards);
        Sound.play("cardPlace1.ogg");
      }
    }

    this.update();
  };

  private showTheirSpeechWithAnimation(onComplete: () => void) {
    this.addView(this.theirPassSpeech);

    const obj = {
      scale: 0,
    };
    this.theirPassSpeech.scale.set(0);
    anime({
      targets: obj,
      scale: 1,
      update: () => {
        this.theirPassSpeech.scale.set(obj.scale);
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

  private updatePlayerInfoViews() {
    if (this.tycoon.isMyTurn()) {
      this.myInfoView.addTurnIndicator();
      this.theirInfoView.removeTurnIndicator();
    } else {
      this.myInfoView.removeTurnIndicator();
      this.theirInfoView.addTurnIndicator();
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
    super.draw();
    this.addView(this.myInfoView);
    this.addView(this.theirInfoView);
    this.addView(this.trashText);
  }

  private drawMyCards() {
    this.addViews(...this.myCards);
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
