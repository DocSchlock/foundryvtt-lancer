import { EntryType } from "../../enums";
import { SourceData } from "../../source-template";
import { PackedPilotGearData } from "../../util/unpacking/packed-types";
import { unpackDeployable } from "../actors/deployable";
import { unpackAction } from "../bits/action";
import { unpackBonus } from "../bits/bonus";
import { unpackSynergy } from "../bits/synergy";
import { LancerDataModel, UnpackContext } from "../shared";
import { template_universal_item, template_bascdt, template_uses } from "./shared";

const fields: any = foundry.data.fields;

// @ts-ignore
export class PilotGearModel extends LancerDataModel {
  static defineSchema() {
    return {
      description: new fields.StringField({ nullable: true }),
      ...template_universal_item(),
      ...template_uses(),
      ...template_bascdt(),
    };
  }
}

export function unpackPilotGear(
  data: PackedPilotGearData,
  context: UnpackContext
): {
  name: string;
  type: EntryType.PILOT_GEAR;
  system: DeepPartial<SourceData.PilotGear>;
} {
  return {
    name: data.name,
    type: EntryType.PILOT_GEAR,
    system: {
      actions: data.actions?.map(unpackAction) ?? [],
      bonuses: data.bonuses?.map(unpackBonus) ?? [],
      synergies: data.synergies?.map(unpackSynergy),
      counters: undefined,
      deployables: data.deployables?.map(d => unpackDeployable(d, context)) ?? [],
      description: data.description,
      lid: data.id,
      tags: [],
    },
  };
}
