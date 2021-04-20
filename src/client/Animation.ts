import anime from "animejs";

class Animation {
  private finishedCount: number;
  private animes: anime.AnimeInstance[];
  private handleComplete: () => void;

  constructor(animes: anime.AnimeInstance[]) {
    this.finishedCount = 0;
    this.animes = animes;

    animes.forEach((anime) => {
      anime.pause();
      anime.finished.then(this.handleFinished);
    });
  }

  public onComplete(cb: () => void) {
    this.handleComplete = cb;
  }

  public play() {
    this.animes.forEach((anime) => anime.play());
  }

  private handleFinished = () => {
    this.finishedCount += 1;
    if (this.finishedCount === this.animes.length) this.handleComplete();
  };
}

export default Animation;
