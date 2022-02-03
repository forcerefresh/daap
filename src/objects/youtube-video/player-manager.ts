import { remove } from "lodash-es";

export class YTPlayerManager {
  protected players: { player: any; id: string }[];

  constructor() {
    this.players = [];
  }

  addPlayer(id: string, player: any) {
    this.players.push({ id, player });
  }

  getPlayer(id: string) {
    return this.players.find((pl) => pl.id === id)?.player;
  }

  remove(id: string) {
    remove(this.players, (pl) => {
      return pl.id === id;
    });
  }
}
