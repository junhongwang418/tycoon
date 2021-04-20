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
import e from "express";

class TycoonViewController extends ViewController {
  private static readonly CARD_SELECTION_OFFSET_Y = 20;

  private tycoon: Tycoon;

  private myCardViews: CardView[];
  private playedCardViews: CardView[][];
  private actionButton: Button;
  private hostLeftRoomAlert: Alert;
  private guestLeftRoomAlert: Alert;
  private winAlert: Alert;
  private loseAlert: Alert;
  private myInfoView: PlayerInfoView;
  private theirInfoView: PlayerInfoView;
  private passSpeech: Speech;

  constructor(tycoonOptions: TycoonOptions) {
    super();

    this.tycoon = new Tycoon(tycoonOptions);

    this.myCardViews = [];
    this.playedCardViews = [];
    this.actionButton = this.createActionButton();
    this.hostLeftRoomAlert = this.createHostLeftRoomAlert();
    this.guestLeftRoomAlert = new Alert("The guest left the game :(");
    this.winAlert = this.createWinAlert();
    this.loseAlert = this.createLoseAlert();
    this.myInfoView = new PlayerInfoView("You");
    this.theirInfoView = new PlayerInfoView("Them");
    this.passSpeech = new Speech("Pass");

    this.enableInteraction();
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

  private createWinAlert() {
    const alert = new Alert("You won 🎉");
    alert.onOk(() => this.popViewController());
    return alert;
  }

  private createLoseAlert() {
    const alert = new Alert("You lost 😵");
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
    this.layoutPassSpeech();
  }

  private layoutPassSpeech() {
    this.passSpeech.setCenterAsOrigin();
    this.passSpeech.x =
      this.theirInfoView.x +
      PlayerInfoView.WIDTH / 2 +
      this.passSpeech.getSize().width / 2 +
      Layout.spacing(2);
    this.passSpeech.y =
      this.passSpeech.getSize().height / 2 + Layout.spacing(2);
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

  private handleGuestLeft = (roomId: string) => {
    this.guestLeftRoomAlert.onOk(() => {
      this.loadViewController(new HostRoomViewController(roomId));
    });
    this.addView(this.guestLeftRoomAlert);
  };

  private handleSocketInitSuccess = (data: SocketInitSuccessData) => {
    this.tycoon.init(data);

    this.myCardViews = this.createMyCards();

    this.layoutMyCards();

    this.addViews(...this.myCardViews);
    this.addView(this.myInfoView);
    this.addView(this.theirInfoView);
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

    if (this.myCardViews.length === 0) {
      this.win();
    } else if (this.tycoon.getNumTheirCards() === 0) {
      this.lose();
    }
  }

  private emitSelectedCards() {
    const selectedCards = this.getSelectedCards();
    const selectedCardModels = selectedCards.map((cv) => cv.model);
    const selectedCardModelJsons = selectedCardModels.map((m) => m.toJson());

    const socket = Application.shared.socket;
    socket.emit("tycoon-action", selectedCardModelJsons);
  }

  private win() {
    this.addView(this.winAlert);
    Application.shared.socket.emit("tycoon-quit");
  }

  private lose() {
    this.addView(this.loseAlert);
    Application.shared.socket.emit("tycoon-quit");
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
    const cardViews = cardJsons.map((json) => {
      const cardView = CardView.fromJson(json);
      cardView.setCenterAsOrigin();
      cardView.x = this.theirInfoView.x;
      cardView.y = this.theirInfoView.y;
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

    const animation = new Animation(
      this.createMovingPlayedCardsToTheSideAnimations()
    );
    animation.onComplete(() => {
      this.playedCardViews.forEach((cvs) => this.removeViews(...cvs));
      this.playedCardViews = [];
      this.update();
    });
    animation.play();
  }

  private handleTheyPass() {
    this.tycoon.play([]);

    this.addView(this.passSpeech);

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
  }

  private moveCardViewsToTheSideWithAnimation(cardViews: CardView[]) {
    cardViews.forEach((card) => {
      anime({
        targets: card,
        x: 0,
        rotation: Math.random() * Math.PI * 2,
        easing: "easeOutQuad",
      });
    });
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

  private layoutSelectedCardsWithAnimation(selectedCards: CardView[]) {
    for (let i = 0; i < selectedCards.length; i++) {
      const card = selectedCards[i];
      anime({
        targets: card,
        x:
          Application.WIDTH / 2 -
          (Layout.spacing(2) * (selectedCards.length - 1)) / 2 +
          Layout.spacing(2) * i,
        y: Application.HEIGHT / 2,
        rotation: Math.random() * Math.PI * 2,
        easing: "easeOutQuad",
      });
    }
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

  private showTheirSpeechWithAnimation() {
    this.addView(this.passSpeech);
    const targets = { scale: 0 };
    this.passSpeech.scale.set(0);
    anime({
      targets,
      scale: 1,
      update: () => this.passSpeech.scale.set(targets.scale),
      complete: () => this.removeView(this.passSpeech),
    });
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
    if (this.tycoon.isMyTurn()) {
      this.myInfoView.addTurnIndicator();
      this.theirInfoView.removeTurnIndicator();
    } else {
      this.myInfoView.removeTurnIndicator();
      this.theirInfoView.addTurnIndicator();
    }

    const numCards = this.tycoon.getMyCards().length;
    const numTheirCards = this.tycoon.getNumTheirCards();
    this.myInfoView.updateNumCardsLeftText(numCards);
    this.theirInfoView.updateNumCardsLeftText(numTheirCards);
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
      const startRadian = (-Math.PI / 64) * (this.myCardViews.length / 2);
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
      const startRadian = (-Math.PI / 64) * (this.myCardViews.length / 2);
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

  private handleForcePassFromNonPass(selectedCards: CardView[]) {
    // e.g. 8-stop
    this.layoutSelectedCardsWithAnimation(selectedCards);
    setTimeout(() => {
      this.moveCardViewsToTheSideWithAnimation();
      setTimeout(() => {
        this.playedCardViews = [];
        if (this.myCardViews.length === 0) this.win();
      }, 1000);
    }, 1000);
  }
}

export default TycoonViewController;
