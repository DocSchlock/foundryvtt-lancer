// Import TypeScript modules
import { LANCER } from "../config";
import { LancerActor } from "../actor/lancer-actor";
import { createChatMessageStep, renderTemplateStep } from "./_render";
import { Tag } from "../models/bits/tag";
import { LancerFlowState } from "./interfaces";
import { Flow, FlowState, Step } from "./flow";
import { UUIDRef } from "../source-template";
import { LancerItem } from "../item/lancer-item";

const lp = LANCER.log_prefix;

export function registerTextSteps(flowSteps: Map<string, Step<any, any> | Flow<any>>) {
  flowSteps.set("printGenericCard", printGenericCard);
  flowSteps.set("printGenericHTML", printGenericHTML);
}

export class SimpleTextFlow extends Flow<LancerFlowState.TextRollData> {
  name = "TextFlow";
  steps = ["printGenericCard"];

  constructor(uuid: UUIDRef | LancerItem | LancerActor, data: Partial<LancerFlowState.TextRollData>) {
    const state: LancerFlowState.TextRollData = {
      title: data?.title ?? "",
      description: data?.description ?? "",
      tags: data?.tags ?? [],
    };
    if (!state.title && uuid instanceof LancerItem) state.title = uuid.name!;

    super(uuid, state);
  }
}

export async function printGenericCard(state: FlowState<any>, options?: { template?: string }): Promise<boolean> {
  if (!state.data) throw new TypeError(`Flow state missing!`);
  renderTemplateStep(
    state.actor,
    options?.template || `systems/${game.system.id}/templates/chat/generic-card.hbs`,
    state.data
  );
  return true;
}

export class SimpleHTMLFlow extends Flow<LancerFlowState.HTMLToChatData> {
  name = "HTMLFlow";
  steps = ["printGenericHTML"];

  constructor(uuid: UUIDRef | LancerItem | LancerActor, data: Partial<LancerFlowState.HTMLToChatData>) {
    const state: LancerFlowState.HTMLToChatData = {
      html: data?.html ?? "",
    };
    super(uuid, state);
  }
}

async function printGenericHTML(state: FlowState<LancerFlowState.HTMLToChatData>): Promise<boolean> {
  if (!state.data) throw new TypeError(`Flow state missing!`);
  if (!state.data.html) {
    if (state.item) {
      const templateData = {
        title: state.item.name,
        description: (state.item.system as any).description ?? "", // Licenses don't have a description
        tags: (state.item.system as any).tags ?? undefined, // Frames don't have tags
      };
      state.data.html = await renderTemplate(`systems/${game.system.id}/templates/chat/generic-card.hbs`, templateData);
    } else if (state.actor) {
      const templateData = {
        title: state.actor.name,
      };
      state.data.html = await renderTemplate(`systems/${game.system.id}/templates/chat/generic-card.hbs`, templateData);
    }
  }
  createChatMessageStep(state.actor, state.data.html);
  return true;
}
