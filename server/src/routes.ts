import { Request, Response } from "express";

let currDrafterIdx = new Map<number, number>();           // draftID => currDrafterIdx
let drafters       = new Map<number, Array<string>>();    // draftID => [drafters]            [drafter1, drafter2, ...]
let optionsRemain  = new Map<number, Array<string>>();    // draftID => [remaining options]   [option1 , option2 , ...]
let roundsRemain   = new Map<number, number>();           // draftID => remaining rounds
let darftIDToNums  = new Map<number, Array<number>>();    // draftID => [nums]                [num1    , num2    , ...]
let numToPick      = new Map<number, string>();           // num     => pick
let numToDrafter   = new Map<number, string>();           // num     => drafter

/**
 * Create a new draft, stores information of the new draft and returns information of the newly created draft
 * @param req request from the client
 * @param res response from the server
 * @returns information of the draft in the following form: { draftID: data1, optionsRemain: data2, roundsRemain: data3, currDrafter: data4 }
 */
export function Create(req: Request, res: Response) {
  // Error Checking
  const msg = checkCreateErrors(req);
  if (msg !== "success") {
    res.status(400).send(JSON.stringify({ msg: JSON.stringify(msg) }));
    return;
  }

  // Save corresponding data to (1)currDrafterIdx, (2)drafters, (3)optionsRemain, (4)roundsRemain
  const draftID =  drafters.size;
  let all_drafters = req.body.drafters.split("\n");
  currDrafterIdx.set(draftID, 0);
  const curr_drafter_idx = currDrafterIdx.get(draftID) as number;
  const currDrafter = all_drafters[curr_drafter_idx];
  drafters.set(draftID, all_drafters);
  optionsRemain.set(draftID, req.body.options.split("\n"));
  roundsRemain.set(draftID, Number(req.body.rounds));

  // Generate data and return
  const data = {
    draftID      : drafters.size - 1,
    optionsRemain: optionsRemain.get(draftID),
    roundsRemain : roundsRemain.get(draftID),
    currDrafter  : currDrafter
  }
  res.send(JSON.stringify(data));
}

/**
 * A drafter drafts an option, update corresponding information regarding the draft
 * @param req request from the client
 * @param res response from the server
 * @returns information regarding the updated draft in the following form: { draftID: data1, optionsRemain: data2, roundsRemain: data3, currDrafter: data4, picks: data5 }
 */
export function Draft(req: Request, res: Response) {
  // Get stored data for later use
  let currDrafter;
  const draftID          = Number(req.body.draftID);
  const all_drafters     = drafters.get(draftID);
  const curr_drafter_idx = currDrafterIdx.get(draftID) as number;
  const rounds_remain    = roundsRemain.get(draftID);
  const options_remain   = optionsRemain.get(draftID);

  // Error Checking
  if (all_drafters === undefined || rounds_remain === undefined || options_remain === undefined) {
    res.status(400).send(JSON.stringify({ msg: JSON.stringify("Invalid 'draftID'!!") }));
    return;
  }

  // Updates currDrafterIdx (moves on to the next drafter)
  currDrafterIdx.set(draftID, (curr_drafter_idx + 1) % all_drafters.length);
  currDrafter = all_drafters[(curr_drafter_idx + 1) % (all_drafters.length)];

  // Updates rounds_remain (decrement by 1 if round ends - all drafters have drafted)
  if (all_drafters.length > 0 && curr_drafter_idx === all_drafters.length - 1) {
    roundsRemain.set(draftID, rounds_remain - 1);
  }

  // Check for valid index. If valid, updates options_remain (removes chosen option)
  const option_idx = options_remain.indexOf(req.body.option);
  if (option_idx === -1) {
    res.status(400).send(JSON.stringify({ msg: JSON.stringify("Invalid 'Option'!!") }));
    return;
  }
  options_remain.splice(option_idx, 1);
  optionsRemain.set(draftID, options_remain);

  // Stores draft in (1)darftIDToNums, (2)numToPick and (3)numToDrafter
  let num = 1;
  if (darftIDToNums.get(draftID) === undefined) {
    darftIDToNums.set(draftID, [num]);
  } else {
    const nums = darftIDToNums.get(draftID);
    if (nums !== undefined) {
      num = nums.length + 1;
      nums.push(num);
      darftIDToNums.set(draftID, nums);
    }
  }
  numToPick.set(num, req.body.option);
  numToDrafter.set(num, all_drafters[curr_drafter_idx]);

  // Generate data and return
  const data = {
    draftID      : draftID,
    optionsRemain: optionsRemain.get(draftID),
    roundsRemain : roundsRemain.get(draftID),
    currDrafter  : currDrafter,
    picks        : getPicksData(draftID)
  }
  res.send(JSON.stringify(data));
}

/**
 * Allows the client to join a draft. If client is one of the drafters => allows to draft when it's turn, else, view mode only.
 * @param req request from the client
 * @param res response from the server
 * @returns the information of the draft for the client to view in the following form: { optionsRemain: data1, roundsRemain: data2, currDrafter: data3, picks: data4 }
 */
export function Join(req: Request, res: Response) {
  // Error Checking
  const draftID      = Number(req.query.draftID);
  const msg          = checkJoinErrors(req);
  if (msg !== "success") {
    res.status(400).send(JSON.stringify({ msg: JSON.stringify(msg) }));
    return;
  }

  // Get data for later use
  const all_drafters     = drafters.get(draftID);
  if (all_drafters === undefined) { return }  // never happens, already checked in checkJoinErrors, but Typescript was not happy!!
  const curr_drafter_idx = currDrafterIdx.get(draftID) as number;
  const currDrafter      = all_drafters[curr_drafter_idx];

  // Generate data and return
  const data = {
    optionsRemain: optionsRemain.get(draftID),
    roundsRemain: roundsRemain.get(draftID),
    currDrafter: currDrafter,
    picks: getPicksData(draftID)
  }
  res.send(JSON.stringify(data));
}

/**
 * Helper function that generate the return data stored in (1)darftIDToNums, (2)numToPick and (3)numToDrafter
 * @param draftID key to darftIDToNums
 * @returns a 2D array in the form of [[num1, pick1, drafter1], [num2, pick2, drafter2], ...]
 */
function getPicksData(draftID: number) {
  let picks = [];
  const nums = darftIDToNums.get(draftID);
  if (nums !== undefined) {
    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      const pick = numToPick.get(num);
      const drafter = numToDrafter.get(num);
      picks.push([num, pick, drafter]);
    }
  }
  return picks
}

/**
 * Deletes all drafts information
 */
export function reset() {
  currDrafterIdx = new Map<number, number>();
  drafters       = new Map<number, Array<string>>();
  optionsRemain  = new Map<number, Array<string>>();
  roundsRemain   = new Map<number, number>();
  darftIDToNums  = new Map<number, Array<number>>();
  numToPick      = new Map<number, string>();
  numToDrafter   = new Map<number, string>();
}

/**
 * Check errors for Create() (helper function)
 * @param req request from the client
 * @returns "success" if no error found, else, return error message
 */
function checkCreateErrors(req: Request) {
  if (Number.isNaN(Number(req.body.rounds)) || Number(req.body.rounds) < 0) {
    return "'Rounds' can't be negative!!";
  } else if (req.body.drafter === "") {
    return "'Drafter' can't be empty!!";
  } else if (req.body.drafters === "") {
    return "'Drafters' can't be empty!!";
  } else if (req.body.options === "") {
    return "'Options' can't be empty!!";
  } else if (!req.body.drafters.split("\n").includes(req.body.drafter)) {
    return "'Drafters' must include 'Drafter'"
  } else if (Number(req.body.rounds) * req.body.drafters.split("\n").length !== req.body.options.split("\n").length) {
    return "'Drafters' * 'Rounds' != 'Options'"
  } else {
    return "success";
  }
}

/**
 * Check errors for Join() (helper function)
 * @param req request from the client
 * @returns "success" if no error found, else, return error message
 */
function checkJoinErrors(req: Request) {
  if (req.query.drafter === "") {
    return "'Drafter' can't be empty!!";
  } else if (req.query.draftID === "") {
    return "'Draft ID' can't be empty!!";
  } else if (!drafters.has(Number(req.query.draftID))) {
    return "'Draft ID' does not exist!!";
  } else if (drafters.get(Number(req.query.draftID)) === undefined) {
    return "Invalid draftID!!";
  } else {
    return "success";
  }
}

/** Returns a list of all the named save files. */
export function Dummy(req: Request, res: Response) {
  const name = first(req.query.name);
  if (name === undefined) {
    res.status(400).send('missing "name" parameter');
  } else {
    res.json(`Hi, ${name}`);
  }
}


// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
function first(param: any): string | undefined {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
}
