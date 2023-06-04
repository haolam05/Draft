import React, { ChangeEvent, Component } from "react";


interface AppState {
  page         : "home" | "draft";
  drafter      : string;
  draftID      : string;
  rounds       : string;
  options      : string;
  drafters     : string;
  curr_options : [];
  curr_drafter : string;
  rounds_remain: number;
  curr_option  : string;
  curr_picks   : [];
}


export class App extends Component<{}, AppState> {

  constructor(props: any) {
    super(props);

    this.state = { page: "home", drafter: "", draftID: "", rounds: "0", options: "", drafters: "", curr_options: [], curr_drafter: "", rounds_remain: 0, curr_option: "", curr_picks: [] };
  }

  render = (): JSX.Element => {
    if (this.state.page === "home") {
      return (
        <div>
          <div>
            <label htmlFor="drafter">Drafter: </label>
            <input id="drafter" type="text" value={this.state.drafter} onChange={this.handleDraftChange}></input>
            <b> (required for either option)</b><br></br><br></br>
          </div>
          <div>
            <b>Join Exisitng Draft</b><br></br><br></br>
            <label htmlFor="draftID">Draft ID: </label>
            <input id="draftID" type="text" value={this.state.draftID} onChange={this.handleDraftIDChange}></input><br></br>
            <button type="submit" onClick={this.joinDraft}>Join</button><br></br><br></br>
          </div>
          <div>
            <b>Create New Draft</b><br></br><br></br>
            <label htmlFor="rounds">Rounds: </label>
            <input id="rounds" type="number" style={{width: '3%'}} onChange={this.handleRoundsChange}></input><br></br><br></br>
          </div>
          <div style={{width: '440px', display: 'flex', justifyContent: 'space-between'}}>
            <div>
              <label htmlFor="options">Options (one per line)</label><br></br>
              <textarea id="options" style={{width: '220px', height: '300px'}} onChange={(evt) => this.handleOptionsChange(evt.target.value)}></textarea>
            </div>
            <div>
              <label htmlFor="drafters">Drafters (one per line, in order)</label><br></br>
              <textarea id="drafters" style={{ width: '220px', height: '300px' }} onChange={(evt) => this.handleDraftersChange(evt.target.value)}></textarea>
            </div>
          </div>
          <button type="submit" onClick={this.createDraft}>Create</button>
        </div>
      )
    } else {
      return (
        <div>
          <b>Status of Draft "{this.state.draftID}"</b><br></br><br></br>
          {this.picksJSX()}{this.selectJSX()}{this.draftButton()}{this.refreshButton()}
        </div>
      )
    }
  };

  handleDraftChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ drafter: evt.target.value });
  }

  handleDraftIDChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ draftID: evt.target.value });
  }

  handleRoundsChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ rounds: evt.target.value });
  }

  handleOptionsChange = (options: string): void => {
    this.setState({ options: options });
  }

  handleDraftersChange = (drafters: string): void => {
    this.setState({ drafters: drafters });
  }

  handleoOptionsChange = (): void => {
    const option = document.querySelector('option:checked') as HTMLOptionElement;
    const check_option = option.value;
    this.setState({ curr_option: check_option });
  }

  createDraft = (): void => {
    const data = {
      "drafter" : this.state.drafter,
      "rounds"  : this.state.rounds,
      "options" : this.state.options,
      "drafters": this.state.drafters
    }
    fetch("/api/create", {method: 'POST', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'}})
      .then(this.handleCreateResponse)
      .catch(this.handleServerError);
  }

  joinDraft = (): void => {
    fetch("/api/join?draftID=" + encodeURIComponent(this.state.draftID) + "&drafter=" + encodeURIComponent(this.state.drafter), {method: "GET"})
      .then(this.handleJoinResponse)
      .catch(this.handleServerError);
  }

  handleJoinResponse = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.handleJoinJson).catch(this.handleServerError);
    } else {
      res.json().then(this.handleServerError);
    }
  }

  handleJoinJson = (val: any) => {
    if (val === null) {
      console.error("bad data from /join: not a record", val)
      return;
    }
    this.setState({ page: "draft", curr_picks: val.picks, curr_options: val.optionsRemain, curr_drafter: val.currDrafter, rounds_remain: val.roundsRemain, curr_option: val.optionsRemain[0]  });
  }

  handleCreateResponse = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.handleCreateJson).catch(this.handleServerError);
    } else {
      res.json().then(this.handleServerError);   // res.json = promise
    }  // res.json() is passed into handleServerError(promise => type any)
  }

  handleCreateJson = (val: any) => {
    if (val === null) {
      console.error("bad data from /create: not a record", val)
      return;
    }
    if (this.state.page === "draft") { this.setState({ curr_picks: val.picks }); }
    this.setState({ page: "draft", draftID: val.draftID, curr_options: val.optionsRemain, curr_drafter: val.currDrafter, rounds_remain: val.roundsRemain, curr_option: val.optionsRemain[0] });
  };

  handleServerError = (_: any) => {
    alert(JSON.parse(_.msg));
    console.error(`unknown error talking to server`);
  }

  draft = (): void => {
    const data = {
      "draftID": this.state.draftID,
      "option" : this.state.curr_option
    }
    fetch("/api/draft", { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } })
      .then(this.handleCreateResponse)
      .catch(this.handleServerError);
  }

  selectJSX = (): Array<JSX.Element> => {
    let select: Array<JSX.Element> = [];
    if (this.state.rounds_remain <= 0) {
      select.push(<span>Draft is complete.</span>)
    } else if (this.state.curr_drafter === this.state.drafter) {
      select.push(<label htmlFor="options"></label>);
      select.push(<br></br>);
      select.push(<br></br>);
      select.push(<select id="options" onChange={this.handleoOptionsChange}>{this.optionsJSX()}</select>);
    } else {
      select.push(<span>Waiting for team {this.state.curr_drafter} to pick.</span>);
      select.push(<br></br>);
      select.push(<br></br>);
    }
    return select;
  }

  optionsJSX = (): Array<JSX.Element> => {
    let options: Array<JSX.Element> = [];
    for (let i = 0; i < this.state.curr_options.length; i++) {
      options.push(<option value={this.state.curr_options[i]}>{this.state.curr_options[i]}</option>);
    }
    return options;
  }

  draftButton = (): Array<JSX.Element> => {
    let button: Array<JSX.Element> = [];
    if (this.state.curr_drafter === this.state.drafter && this.state.rounds_remain > 0) {
      button.push(<button type="submit" onClick={this.draft} style={{marginLeft: '5px'}}>Draft</button>);
    }
    return button;
  }

  refreshButton = (): Array<JSX.Element> => {
    let button: Array<JSX.Element> = [];
    if (this.state.curr_drafter !== this.state.drafter && this.state.rounds_remain > 0) {
      button.push(<button type="reset" onClick={this.joinDraft}>Refresh</button>);
    }
    return button;
  }

  picksJSX = (): Array<JSX.Element> => {
    let picks: Array<JSX.Element> = [];
    if (this.state.rounds_remain >= 0) {
      if (this.state.curr_picks.length === 0) {
        picks.push(<span>No picks made yet.</span>);
        picks.push(<br></br>);
      } else {
        picks.push(<table><tr><th>Num</th><th>Pick</th><th>Drafter</th></tr>{this.pickJSX()}</table>)
      }
      picks.push(<br></br>);
      if (this.state.curr_drafter === this.state.drafter && this.state.rounds_remain > 0) {
        picks.push(<span>It's your pick!</span>);
      }
    }
    return picks;
  }

  pickJSX = (): Array<JSX.Element> => {
    let result: Array<JSX.Element> = [];
    for (let i = 0; i < this.state.curr_picks.length; i++) {
      result.push(<tr><td>{this.state.curr_picks[i][0]}</td><td>{this.state.curr_picks[i][1]}</td><td>{this.state.curr_picks[i][2]}</td></tr>)
    }
    return result;
  }
}
