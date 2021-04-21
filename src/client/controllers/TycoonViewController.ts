import * as PIXI from "pixi.js";
import Button from "../views/Button";
import CardView from "../views/CardView";
import Application from "../Application";
import ViewController from "./ViewController";
import { CardJson } from "../../common/Card";
import { TycoonOptions, SocketInitSuccessData } from "../../common/Tycoon";
import LobbyViewController from "./LobbyViewController";
import HostRoomViewController from "./HostRoomViewController";
import Alert from "../views/Alert";
import Tycoon from "../Tycoon";
import anime from "animejs";
import Speech from "../views/Speech";
import Layout from "../Layout";
import PlayerInfoView from "../views/PlayerInfoView";
import Animation from "../Animation";
import { RoomJson } from "../../common/Room";

class TycoonViewController extends ViewController {
  private static readonly CARD_SELECTION_OFFSET_Y = 20;

  private tycoon: Tycoon;

  private myCardViews: CardView[];
  private playedCardViews: CardView[][];
  private actionButton: Button;
  private hostLeftRoomAlert: Alert;
  private guestLeftRoomAlert: Alert;
  private playerInfoViews: { [turn: number]: PlayerInfoView };
  private passSpeech: Speech;

  constructor(numPlayers: number, tycoonOptions: TycoonOptions) {
    super();

    this.tycoon = new Tycoon(numPlayers, tycoonOptions);

    this.myCardViews = [];
    this.playedCardViews = [];
    this.actionButton = this.createActionButton();
    this.hostLeftRoomAlert = this.createHostLeftRoomAlert();
    this.guestLeftRoomAlert = new Alert("The guest left the game :(");
    this.playerInfoViews = this.createPlayerInfoViews(numPlayers);
    this.passSpeech = new Speech("Pass");

    this.enableInteraction();
  }

  private createPlayerInfoViews(numPlayers: number) {
    const playerInfoViews: PlayerInfoView[] = [];
    for (let i = 0; i < numPlayers; i++) {
      playerInfoViews[i] = new PlayerInfoView(`Player ${i}`);
    }
    return playerInfoViews;
  }

  private enableInteraction() {
    this.interactive = true;
    this.defineHitArea();
  }

  private defineHitArea() {
    this.hitArea = new PIXI.Rectangle(
      0,
      0,
      Application.WIDTH,
      Application.HEIGHT
    );
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
  }

  private layoutPassSpeech(turn: number) {
    this.passSpeech.setCenterAsOrigin();
    this.passSpeech.x = this.playerInfoViews[turn].x;
    this.passSpeech.y =
      this.playerInfoViews[turn].y +
      PlayerInfoView.HEIGHT / 2 -
      this.passSpeech.getSize().height / 2 -
      Layout.spacing(1);
  }

  private layoutPlayerInfoViews() {
    const myTurn = this.tycoon.getMyTurn();
    const myPlayerInfoView = this.playerInfoViews[myTurn];
    const theirPlayerInfoViews = Object.entries(this.playerInfoViews)
      .filter(([key, _]) => key !== myTurn.toString())
      .map(([_, value]) => value);

    myPlayerInfoView.x = Layout.spacing(2);
    myPlayerInfoView.y =
      Application.HEIGHT - PlayerInfoView.HEIGHT - Layout.spacing(2);

    const offset = this.tycoon.getMyTurn() % theirPlayerInfoViews.length;

    if (theirPlayerInfoViews.length === 1) {
      const playerInfoView = theirPlayerInfoViews[offset];
      this.layoutPlayerInfoViewTop(playerInfoView);
    } else if (theirPlayerInfoViews.length === 2) {
      const playerInfoView1 = theirPlayerInfoViews[offset];
      this.layoutPlayerInfoViewTopLeft(playerInfoView1);

      const playerInfoView2 =
        theirPlayerInfoViews[(1 + offset) % theirPlayerInfoViews.length];
      this.layoutPlayerInfoViewTopRight(playerInfoView2);
    } else if (theirPlayerInfoViews.length === 3) {
      const playerInfoView1 = theirPlayerInfoViews[offset];
      this.layoutPlayerInfoViewTopLeft(playerInfoView1);

      const playerInfoView2 =
        theirPlayerInfoViews[(1 + offset) % theirPlayerInfoViews.length];
      this.layoutPlayerInfoViewTop(playerInfoView2);

      const playerInfoView3 =
        theirPlayerInfoViews[(2 + offset) % theirPlayerInfoViews.length];
      this.layoutPlayerInfoViewTopRight(playerInfoView3);
    }
  }

  private layoutPlayerInfoViewTopLeft(playerInfoView: PlayerInfoView) {
    playerInfoView.setCenterAsOrigin();
    playerInfoView.x = PlayerInfoView.WIDTH / 2 + Layout.spacing(2);
    playerInfoView.y = PlayerInfoView.HEIGHT / 2 + Layout.spacing(2);
  }

  private layoutPlayerInfoViewTop(playerInfoView: PlayerInfoView) {
    playerInfoView.setCenterAsOrigin();
    playerInfoView.x = Application.WIDTH / 2;
    playerInfoView.y = PlayerInfoView.HEIGHT / 2 + Layout.spacing(2);
  }

  private layoutPlayerInfoViewTopRight(playerInfoView: PlayerInfoView) {
    playerInfoView.setCenterAsOrigin();
    playerInfoView.x =
      Application.WIDTH - PlayerInfoView.WIDTH / 2 - Layout.spacing(2);
    playerInfoView.y = PlayerInfoView.HEIGHT / 2 + Layout.spacing(2);
  }

  private layoutActionButton() {
    this.actionButton.x =
      Application.WIDTH - this.actionButton.getSize().width - Layout.spacing(2);
    this.actionButton.y =
      Application.HEIGHT -
      this.actionButton.getSize().height -
      Layout.spacing(2);
  }

  protected onInit() {
    super.onInit();
    const socket = Application.shared.socket;
    socket.emit("tycoon-init");
  }

  public addEventListeners() {
    super.addEventListeners();
    this.on("pointerdown", this.handlePointerDown);

    const socket = Application.shared.socket;
    socket.on("tycoon-init-success", this.handleSocketInitSuccess);
    socket.on("tycoon-update", this.handleSocketUpdate);
    socket.on("room-host-leave", this.handleHostLeft);
    socket.on("room-guest-leave", this.handleGuestLeft);
  }

  public removeEventListeners() {
    super.removeEventListeners();
    this.off("pointerdown", this.handlePointerDown);

    const socket = Application.shared.socket;
    socket.off("tycoon-init-success", this.handleSocketInitSuccess);
    socket.off("tycoon-update", this.handleSocketUpdate);
    socket.off("room-host-leave", this.handleHostLeft);
    socket.off("room-guest-leave", this.handleGuestLeft);
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

  private handleGuestLeft = (roomJson: RoomJson) => {
    this.guestLeftRoomAlert.onOk(() => {
      this.loadViewController(new HostRoomViewController(roomJson));
    });
    this.addView(this.guestLeftRoomAlert);
  };

  private handleSocketInitSuccess = (data: SocketInitSuccessData) => {
    this.tycoon.init(data);

    this.myCardViews = this.createMyCards();

    this.layoutMyCards();
    this.layoutPlayerInfoViews();

    this.addViews(...this.myCardViews);
    this.addViews(...Object.values(this.playerInfoViews));
    this.addView(this.actionButton);

    this.update();
  };

  private createMyCards() {
    const cardViews = this.tycoon.getMyCards().map((card) => {
      const cardView = new CardView(card);
      cardView.setCenterAsOrigin();
      cardView.enableSelection();
      cardView.onSelect((selected: boolean) => {
        cardView.y +=
          TycoonViewController.CARD_SELECTION_OFFSET_Y * (selected ? -1 : 1);
      });
      return cardView;
    });
    cardViews.sort(CardView.comparator);
    return cardViews;
  }

  private update() {
    this.updatePlayerInfoViews();
    this.updateActionButton();
    this.updateMyCardsInteraction();

    if (this.tycoon.isGameOver()) {
      const alert = new Alert("Game Over");
      Application.shared.socket.emit("tycoon-quit");
      alert.onOk(() => {
        this.popViewController();
      });
      this.addView(alert);
    }
  }

  private emitSelectedCards() {
    const selectedCards = this.getSelectedCards();
    const selectedCardModels = selectedCards.map((cv) => cv.model);
    const selectedCardModelJsons = selectedCardModels.map((m) => m.toJson());

    const socket = Application.shared.socket;
    socket.emit("tycoon-action", selectedCardModelJsons);
  }

  private handleActionButtonPointerDown = () => {
    this.actionButton.disable();
    if (this.getSelectedCards().length === 0) {
      this.handleIPass();
    } else {
      this.handleIPlay();
    }
  };

  private handleSocketUpdate = (lastCardJsons: CardJson[]) => {
    this.actionButton.disable();
    if (lastCardJsons.length === 0) {
      this.handleTheyPass();
    } else {
      this.handleTheyPlay(lastCardJsons);
    }
  };

  private handleIPlay() {
    this.emitSelectedCards();

    const selectedCards = this.getSelectedCards();
    selectedCards.forEach((cv) => cv.bringToFront());

    this.tycoon.play(selectedCards.map((cv) => cv.model));
    this.myCardViews = this.getUnselectedCards();

    const animation = new Animation([
      ...this.createThrowCardsToTheCenterAnimations(selectedCards),
      ...this.createRepositionMyCardsAnimations(),
    ]);
    animation.onComplete(() => {
      this.playedCardViews.push(selectedCards);

      if (this.tycoon.getPrevCards().length === 0) {
        // e.g. 8-stop
        const nextAnimation = new Animation(
          this.createMovingPlayedCardsToTheSideAnimations()
        );
        nextAnimation.onComplete(() => {
          this.playedCardViews.forEach((cardViews) =>
            this.removeViews(...cardViews)
          );
          this.playedCardViews = [];
          this.update();
        });
        nextAnimation.play();
      } else {
        this.update();
      }
    });
    animation.play();
  }

  private handleTheyPlay(cardJsons: CardJson[]) {
    const currentTurn = this.tycoon.getCurrentTurn();

    const cardViews = cardJsons.map((json) => {
      const cardView = CardView.fromJson(json);
      cardView.setCenterAsOrigin();
      cardView.x = this.playerInfoViews[currentTurn].x;
      cardView.y = this.playerInfoViews[currentTurn].y;
      return cardView;
    });
    this.addViews(...cardViews);

    this.tycoon.play(cardViews.map((cv) => cv.model));

    const animation = new Animation(
      this.createThrowCardsToTheCenterAnimations(cardViews)
    );
    animation.onComplete(() => {
      this.playedCardViews.push(cardViews);

      if (this.tycoon.getPrevCards().length === 0) {
        // e.g. 8-stop
        const nextAnimation = new Animation(
          this.createMovingPlayedCardsToTheSideAnimations()
        );
        nextAnimation.onComplete(() => {
          this.playedCardViews.forEach((cardViews) =>
            this.removeViews(...cardViews)
          );
          this.playedCardViews = [];
          this.update();
        });
        nextAnimation.play();
      } else {
        this.update();
      }
    });
    animation.play();
  }

  private handleIPass() {
    this.emitSelectedCards();

    this.tycoon.play([]);

    if (this.tycoon.getPlayedCards().length === 0) {
      const animation = new Animation(
        this.createMovingPlayedCardsToTheSideAnimations()
      );
      animation.onComplete(() => {
        this.playedCardViews.forEach((cvs) => this.removeViews(...cvs));
        this.playedCardViews = [];
        this.update();
      });
      animation.play();
    } else {
      this.update();
    }
  }

  private handleTheyPass() {
    const currentTurn = this.tycoon.getCurrentTurn();

    this.tycoon.play([]);

    this.layoutPassSpeech(currentTurn);
    this.addView(this.passSpeech);

    this.playerInfoViews[currentTurn].removeTurnIndicator();

    if (this.tycoon.getPlayedCards().length === 0) {
      const animation = new Animation([
        ...this.createMovingPlayedCardsToTheSideAnimations(),
        this.createPassSpeechScaleUpAnimation(),
      ]);
      animation.onComplete(() => {
        this.removeView(this.passSpeech);
        this.playedCardViews.forEach((cvs) => this.removeViews(...cvs));
        this.playedCardViews = [];
        this.update();
      });
      animation.play();
    } else {
      const animation = new Animation([
        this.createPassSpeechScaleUpAnimation(),
      ]);
      animation.onComplete(() => {
        this.removeView(this.passSpeech);
        this.update();
      });
      animation.play();
    }
  }

  private createMovingCardViewsToTheSideAnimations(cardViews: CardView[]) {
    const animations = [];
    cardViews.forEach((card) => {
      animations.push(
        anime({
          targets: card,
          x: 0,
          rotation: Math.random() * Math.PI * 2,
          easing: "easeOutQuad",
        })
      );
    });
    return animations;
  }

  private createMovingPlayedCardsToTheSideAnimations() {
    const animations = [];
    this.playedCardViews.forEach((cardViews) =>
      animations.push(
        ...this.createMovingCardViewsToTheSideAnimations(cardViews)
      )
    );
    return animations;
  }

  private createThrowCardsToTheCenterAnimations(selectedCards: CardView[]) {
    const animes: anime.AnimeInstance[] = [];
    for (let i = 0; i < selectedCards.length; i++) {
      const card = selectedCards[i];
      animes.push(
        anime({
          targets: card,
          x:
            Application.WIDTH / 2 -
            (Layout.spacing(2) * (selectedCards.length - 1)) / 2 +
            Layout.spacing(2) * i,
          y: Application.HEIGHT / 2,
          rotation: Math.random() * Math.PI * 2,
          easing: "easeOutQuad",
        })
      );
    }
    return animes;
  }

  private createPassSpeechScaleUpAnimation() {
    const targets = { scale: 0 };
    this.passSpeech.scale.set(0);
    return anime({
      targets,
      scale: 1,
      update: () => this.passSpeech.scale.set(targets.scale),
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
    const myTurn = this.tycoon.getMyTurn();
    const currTurn = this.tycoon.getCurrentTurn();
    const prevTurn = this.tycoon.getPrevTurn();

    if (prevTurn != null) this.playerInfoViews[prevTurn].removeTurnIndicator();
    this.playerInfoViews[currTurn].addTurnIndicator();

    const numCards = this.tycoon.getMyCards().length;
    const numTheirCards = this.tycoon.getNumTheirCards();
    this.playerInfoViews[myTurn].updateNumCardsLeftText(numCards);
    Object.entries(numTheirCards).forEach(([key, value]) => {
      this.playerInfoViews[key].updateNumCardsLeftText(value);
    });
  }

  private updateActionButton() {
    if (this.tycoon.isMyTurn()) {
      if (
        this.tycoon.validateNextCards(
          this.getSelectedCards().map((cv) => cv.model)
        )
      ) {
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
    return this.myCardViews.filter((card) => card.isSelected());
  }

  private getUnselectedCards() {
    return this.myCardViews.filter((card) => !card.isSelected());
  }

  private handlePointerDown = () => {
    if (!this.tycoon.isMyTurn()) return;
    this.updateActionButton();
  };

  private createRepositionMyCardsAnimations() {
    const animes: anime.AnimeInstance[] = [];
    const circleRadius = 500;
    const circleCenterX = Application.WIDTH / 2;
    const circleCenterY = Application.HEIGHT + circleRadius - 100;

    this.myCardViews.forEach((card, index) => {
      const startRadian = (-Math.PI / 72) * (this.myCardViews.length / 2);
      const endRadian = -startRadian;
      const stepRadian =
        (endRadian - startRadian) / (this.myCardViews.length - 1);
      const rotationRadian = startRadian + stepRadian * index || 0;
      animes.push(
        anime({
          targets: card,
          rotation: rotationRadian,
          x: circleCenterX + circleRadius * Math.sin(rotationRadian),
          y: circleCenterY - circleRadius * Math.cos(rotationRadian),
        })
      );
    });

    return animes;
  }

  private layoutMyCards() {
    const circleRadius = 500;
    const circleCenterX = Application.WIDTH / 2;
    const circleCenterY = Application.HEIGHT + circleRadius - 100;

    this.myCardViews.forEach((card, index) => {
      const startRadian = (-Math.PI / 72) * (this.myCardViews.length / 2);
      const endRadian = -startRadian;
      const stepRadian =
        (endRadian - startRadian) / (this.myCardViews.length - 1);
      const rotationRadian = startRadian + stepRadian * index || 0;
      card.rotation = rotationRadian;
      card.x = circleCenterX + circleRadius * Math.sin(rotationRadian);
      card.y = circleCenterY - circleRadius * Math.cos(rotationRadian);
    });
  }

  private disableMyCardsInteraction() {
    this.myCardViews.forEach((card) => card.disableSelection());
  }

  private enableMyCardsInteraction() {
    this.myCardViews.forEach((card) => card.enableSelection());
  }
}

export default TycoonViewController;
