import { TycoonOptionKey } from "../../common/Tycoon";
import CheckMark from "./CheckMark";

class TycoonOptionCheckMark extends CheckMark {
  private optionKey: TycoonOptionKey;

  constructor(optionKey: TycoonOptionKey) {
    super({ fontSize: 36 });
    this.optionKey = optionKey;
  }

  public onCheck(cb: (optionKey: TycoonOptionKey, checked: boolean) => void) {
    this.onPointerDown((checked: boolean) => cb(this.optionKey, checked));
  }
}

export default TycoonOptionCheckMark;
