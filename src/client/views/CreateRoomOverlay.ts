import Application from "../Application";
import Color from "../Color";
import Layout from "../Layout";
import Button from "./Button";
import Frame from "./Frame";
import Overlay from "./Overlay";
import Text from "./Text";

class CreateRoomOverlay extends Overlay {
  private static readonly MIN_ROOM_CAPACITY = 2;
  private static readonly DEFAULT_ROOM_CAPACITY = 2;
  private static readonly MAX_ROOM_CAPACITY = 4;

  private static get WIDTH() {
    return Application.WIDTH / 2;
  }

  private static get HEIGHT() {
    return Application.HEIGHT / 2;
  }

  private capacity: number;

  private frame: Frame;
  private selectRoomCapacityText: Text;
  private createButton: Button;
  private capacityText: Text;
  private incrementCapacityButton: Button;
  private decrementCapacityButton: Button;

  private handleCreate: () => void;

  constructor() {
    super();
    this.capacity = CreateRoomOverlay.DEFAULT_ROOM_CAPACITY;
    this.frame = new Frame({
      width: CreateRoomOverlay.WIDTH,
      height: CreateRoomOverlay.HEIGHT,
      border: Color.White,
    });
    this.selectRoomCapacityText = new Text("Select Room Capacity");
    this.createButton = this.createCreateButton();
    this.capacityText = new Text(this.capacity.toString());
    this.incrementCapacityButton = this.createIncrementCapacityButton();
    this.decrementCapacityButton = this.createDecrementCapacityButton();
  }

  private updateCapacityText() {
    this.capacityText.updateText(this.capacity.toString());
  }

  private createCreateButton() {
    const button = new Button("Create");
    button.onPointerDown(() => this.handleCreate());
    return button;
  }

  private createIncrementCapacityButton() {
    const button = new Button("▶");
    button.onPointerDown(this.handleIncrementCapacity);
    return button;
  }

  private handleIncrementCapacity = () => {
    this.capacity += 1;
    this.updateCapacityText();

    if (this.capacity >= CreateRoomOverlay.MAX_ROOM_CAPACITY) {
      this.incrementCapacityButton.disable();
    }

    if (this.capacity > CreateRoomOverlay.MIN_ROOM_CAPACITY) {
      this.decrementCapacityButton.enable();
    }
  };

  private createDecrementCapacityButton() {
    const button = new Button("◀");
    button.disable();
    button.onPointerDown(this.handleDecrementCapacity);
    return button;
  }

  private handleDecrementCapacity = () => {
    this.capacity -= 1;
    this.updateCapacityText();

    if (this.capacity <= CreateRoomOverlay.MIN_ROOM_CAPACITY) {
      this.decrementCapacityButton.disable();
    }

    if (this.capacity < CreateRoomOverlay.MAX_ROOM_CAPACITY) {
      this.incrementCapacityButton.enable();
    }
  };

  protected layout() {
    super.layout();
    this.layoutFrame();
    this.layoutSelectRoomCapacityText();
    this.layoutCreateButton();
    this.layoutCapacityText();
    this.layoutIncrementCapacityButton();
    this.layoutDecrementCapacityButton();
  }

  private layoutIncrementCapacityButton() {
    this.incrementCapacityButton.setCenterAsOrigin();
    this.incrementCapacityButton.x = Application.WIDTH / 2 + Layout.spacing(6);
    this.incrementCapacityButton.y = Application.HEIGHT / 2;
  }

  private layoutDecrementCapacityButton() {
    this.decrementCapacityButton.setCenterAsOrigin();
    this.decrementCapacityButton.x = Application.WIDTH / 2 - Layout.spacing(6);
    this.decrementCapacityButton.y = Application.HEIGHT / 2;
  }

  private layoutCapacityText() {
    this.capacityText.setCenterAsOrigin();
    this.capacityText.x = Application.WIDTH / 2;
    this.capacityText.y = Application.HEIGHT / 2;
  }

  private layoutCreateButton() {
    this.createButton.setCenterAsOrigin();
    this.createButton.x = Application.WIDTH / 2;
    this.createButton.y = Application.HEIGHT / 2 + Layout.spacing(10);
  }

  private layoutFrame() {
    this.frame.setCenterAsOrigin();
    this.frame.x = Application.WIDTH / 2;
    this.frame.y = Application.HEIGHT / 2;
  }

  private layoutSelectRoomCapacityText() {
    this.selectRoomCapacityText.setCenterAsOrigin();
    this.selectRoomCapacityText.x = Application.WIDTH / 2;
    this.selectRoomCapacityText.y = Application.HEIGHT / 2 - Layout.spacing(10);
  }

  protected draw() {
    super.draw();
    this.addView(this.frame);
    this.addView(this.selectRoomCapacityText);
    this.addView(this.createButton);
    this.addView(this.capacityText);
    this.addView(this.incrementCapacityButton);
    this.addView(this.decrementCapacityButton);
  }

  public onCreate(cb: () => void) {
    this.handleCreate = cb;
  }

  public getCapacity() {
    return this.capacity;
  }
}

export default CreateRoomOverlay;
