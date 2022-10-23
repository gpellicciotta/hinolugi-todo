let nextRouteId = 1;

/**
 *  An URL route.
 */
export class Route 
{
  /**
   * Create a route based on following properties:
   *   - id
   *   - routeRegex
   *   - description
   *   - disabled
   *   - actionCallback   
   */
  constructor(actionProps) {
    this.id = actionProps.id || ('route-' + (nextRouteId++));
    this.routeRegex = actionProps.routeRegex;
    this.description = actionProps.description;
    this.disabled = actionProps.disabled;
    this.activateCallback = actionProps.activateCallback;
  }
}