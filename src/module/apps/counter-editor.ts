import { Counter, RegEntry } from "machine-mind";
import { gentle_merge, resolve_dotpath } from "../helpers/commons";

/**
 * A helper FormApplication subclass for editing a counter
 * @extends {FormApplication}
 */
export class CounterEditForm<O> extends FormApplication {
  _updateObject(event: Event, formData?: object): Promise<unknown> {
    debugger;
    return new Promise(() => {});
  }
  // The counter we're editing
  counter: Counter;

  // Where it is
  path: string;

  constructor(target: O, path: string, dialogData: Dialog.Data, options: Partial<Dialog.Options> = {}) {
    super(dialogData, options);
    this.path = path;
    this.counter = resolve_dotpath(target, path);
  }

  /* -------------------------------------------- */

  /** @override */
  static get defaultOptions(): FormApplication.Options {
    return {
      ...super.defaultOptions,
      template: `systems/${game.system.id}/templates/window/counter.hbs`,
      width: 400,
      height: "auto",
      classes: ["lancer"],
    };
  }

  /** @override
   * Expose our data
   */
  getData(): any {
    return {
      ...super.getData(),
      counter: this.counter,
      path: this.path,
    };
  }

  /* -------------------------------------------- */

  /**
   * A helper constructor function which displays the bonus editor and returns a Promise once it's
   * workflow has been resolved.
   * @param in_object
   * @param at_path
   * @param writeback_obj
   * @returns
   */
  static async edit_counter<T>(in_object: T, at_path: string, writeback_obj: RegEntry<any>): Promise<void> {
    return new Promise((resolve, _reject) => {
      const dlg = new this(in_object, at_path, {
        title: "Edit Counter",
        content: "",
        buttons: {
          confirm: {
            icon: '<i class="fas fa-save"></i>',
            label: "Save",
            callback: html => {
              // Idk how to get form data - FormData doesn't work :(
              // Just collect inputs manually
              let flat_data: any = {};
              $(html)
                .find("input")
                .each((_i, elt) => {
                  // Retrieve input info
                  let name = elt.name;
                  let val: boolean | string | number;
                  if (elt.type == "text") {
                    val = elt.value;
                  } else if (elt.type == "number") {
                    val = parseInt(elt.value);
                  } else if (elt.type == "checkbox") {
                    val = elt.checked;
                  } else {
                    return;
                  }

                  // Add to form
                  flat_data[at_path.concat(".").concat(name)] = val;
                });

              // Do the merge
              gentle_merge(in_object, flat_data);
              resolve(writeback_obj.writeback());
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => resolve(),
          },
        },
        default: "confirm",
        close: () => resolve(),
      });
      dlg.render(true);
    });
  }
}
