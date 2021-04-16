import * as PIXI from "pixi.js";
import Color from "../Color";
import Layout from "../Layout";
import Text from "./Text";
import TurnIndicator from "./TurnIndicator";
import View from "./View";

class PlayerInfoView extends View {
  public static readonly WIDTH = 128;
  public static readonly HEIGHT = 128;

  private frame: PIXI.Graphics;
  private playerNameText: Text;
  private numCardsLeftText: Text;
  private turnIndicator: TurnIndicator;

  constructor(playerName: string) {
    super();
    this.frame = this.createFrame();
    this.playerNameText = new Text(playerName, { fontSize: 16 });
    this.numCardsLeftText = new Text("", { fontSize: 12 });
    this.turnIndicator = new TurnIndicator();
  }

  protected layout() {
    super.layout();
    this.layoutPlayerNameText();
    this.layoutNumCardsLeftText();
    this.layoutTurnIndicator();
  }

  private layoutTurnIndicator() {
    this.turnIndicator.setCenterAsOrigin();
    this.turnIndicator.x = PlayerInfoView.WIDTH / 2;
    this.turnIndicator.y =
      PlayerInfoView.HEIGHT -
      this.turnIndicator.getTextSize().height / 2 -
      Layout.spacing(1);
  }

  private layoutNumCardsLeftText() {
    this.numCardsLeftText.setCenterAsOrigin();
    this.numCardsLeftText.x = PlayerInfoView.WIDTH / 2;
    this.numCardsLeftText.y =
      this.playerNameText.y +
      this.playerNameText.getTextSize().height / 2 +
      this.numCardsLeftText.getTextSize().height / 2 +
      Layout.spacing(1);
  }

  private layoutPlayerNameText() {
    this.playerNameText.setCenterAsOrigin();
    this.playerNameText.x = PlayerInfoView.WIDTH / 2;
    this.playerNameText.y =
      this.playerNameText.getTextSize().height / 2 + Layout.spacing(1);
  }

  protected draw() {
    super.draw();
    this.addChild(this.frame);
    this.addView(this.playerNameText);
    this.addView(this.numCardsLeftText);
  }

  private createFrame() {
    const frame = new PIXI.Graphics();
    frame.lineStyle(1, Color.White);
    frame.drawRect(0, 0, PlayerInfoView.WIDTH, PlayerInfoView.HEIGHT);
    return frame;
  }

  public addTurnIndicator() {
    this.addView(this.turnIndicator);
  }

  public removeTurnIndicator() {
    this.removeView(this.turnIndicator);
  }

  public updateNumCardsLeftText(numCardsLeft: number) {
    this.numCardsLeftText.updateText(`Cards Left: ${numCardsLeft}`);
  }
}

export default PlayerInfoView;
