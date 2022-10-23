let nextActionId = 1;

/**
 *  An executable action.
 *  Can be invoked from a menu, a button, via a shortcut or a combination of all these.
 */
export class Action 
{
  /**
   * Create an action based on following properties:
   *   - id
   *   - name
   *   - description
   *   - icon
   *   - shortcut
   *   - disabled
   *   - actionCallback   
   */
  constructor(actionProps) {
    this.id = actionProps.id || ('action-' + (nextActionId++));
    this.name = actionProps.name;
    this.description = actionProps.description;
    this.icon = actionProps.icon;
    this.shortcut = actionProps.shortcut;
    this.disabled = actionProps.disabled;
    this.actionCallback = actionProps.actionCallback;
  }
}