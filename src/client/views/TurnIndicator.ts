import anime from "animejs";
import Text from "./Text";

class TurnIndicator extends Text {
  constructor() {
    super("🂠");
    this.startSpinningForeverAnimation();
  }

  private startSpinningForeverAnimation() {
    anime({
      targets: this,
      rotation: Math.PI * 2,
      loop: true,
      easing: "easeInOutSine",
      duration: 1200,
    });
  }
}

export default TurnIndicator;
