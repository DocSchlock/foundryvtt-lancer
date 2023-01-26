import { ActionTrackingData } from "../action";
import { getActions } from "../action/action-tracker";
import { LancerActor } from "../actor/lancer-actor";
import { prepareTextMacro } from "./text";
import { getMacroSpeaker } from "./_util";

/**
 * Renders out an update of the current action status for a turn change in combat.
 * @param actorUUID     String of the actor UUID to roll the macro as
 * @param actions Action data of the actor
 * @param start True if start of turn, false if end of turn
 */
export function prepareActionTrackMacro(actorUUID: string, start: boolean) {
  // Determine which Actor to speak as
  let actor = getMacroSpeaker(actorUUID);
  if (!actor) return;

  const actions = getActions(actor);
  if (!actions) return;

  let text: string;
  if (start) {
    text = `// ${actor.name} is starting their turn. //`;
  } else {
    text = `// ${actor.name} is ending their turn: //<br/>`;
    text += condensedActionButtonHTML(actor, actions);
  }
  prepareTextMacro(actorUUID, "Action Status", text);
}

function condensedActionButtonHTML(actor: LancerActor, actions: ActionTrackingData) {
  function constructButton(action: string, active: boolean) {
    let mIcon;
    switch (action) {
      case "protocol":
        mIcon = "cci cci-protocol";
        break;
      case "move":
        mIcon = "mdi mdi-arrow-right-bold-hexagon-outline";
        break;
      case "full":
        mIcon = "mdi mdi-hexagon-slice-6";
        break;
      case "quick":
        mIcon = "mdi mdi-hexagon-slice-3";
        break;
      case "reaction":
        mIcon = "cci cci-reaction";
        break;
    }

    return `
        <button class="action-size-${action} lancer-action-button${active ? ` active activation-${action}` : ""}${
      false ? ` enabled` : ""
    }"><i class="${mIcon} i--m"></i></button>`;
  }

  let buttons = "";
  for (const action in actions) {
    const val: boolean | number = (actions as any)[action];
    let active = false;
    if (typeof val == "boolean") {
      active = val;
    } else {
      active = val > 0;
    }
    buttons += constructButton(action, active);
  }
  return `<div class="track-message lancer-action-grid">${buttons}</div`;
}
