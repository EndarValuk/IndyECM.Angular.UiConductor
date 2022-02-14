import { Injectable } from '@angular/core';
// External dependencies
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
// Local dependencies
import { ComponentModeType } from './component-mode.type';
import { ComponentStateType } from './conponent-state.type';

/**
 * Low-level components state management service.
 *
 * @author EndarValuk
 */
@Injectable()
export class ComponentConductorService {
  //#region Mode

  /**
   * Internal form mode type.
   */
  private readonly _modeStream: BehaviorSubject<ComponentModeType> = new BehaviorSubject<ComponentModeType>(ComponentModeType.View);
  /**
   * Form mode type stream
   */
  public readonly mode$: Observable<ComponentModeType> = this._modeStream.asObservable();

  /**
   * Change mode
   * @param {ComponentModeType} newMode Destination mode
   */
  public changeMode(newMode: ComponentModeType): void {
    this._modeStream.next(newMode);
  }

  //#endregion

  //#region State

  /**
   * Form state type
   */
  private readonly _stateStream: BehaviorSubject<ComponentStateType> = new BehaviorSubject<ComponentStateType>(ComponentStateType.AtWork);
  /**
   * Form state type stream
   */
  public readonly state$: Observable<ComponentStateType> = this._stateStream.asObservable();

  /**
   * Change state
   * @param {ComponentState} newState Destination state
   */
  public changeState(newState: ComponentStateType): void {
    this._stateStream.next(newState);
  }

  //#endregion

  //#region Data

  private _firstCheck: boolean = true;

  private readonly _dataStream: BehaviorSubject<any> = new BehaviorSubject([]);
  /**
   * Current loaded data
   */
  public readonly dataSource$: Observable<any> = this._dataStream.asObservable();

  public setData(newData: any): void {
    this._dataStream.next(newData);
  }

  private readonly _displayedDataStream: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  /**
   * Current displayed data
   */
  public readonly displayedData$: Observable<any> = this._displayedDataStream.asObservable();

  public setDisplayedData(newData: any): void {
    this._displayedDataStream.next(newData);
  }

  public displayedDataOverflow: boolean = false;

  public displayedDataLimit?: number = undefined;

  public filterData<T, TD>(filter: T, filterAction?: (filter: T, data: TD[]) => TD[], afterEffect?: (data: TD[]) => void): void {
    let nextState: ComponentStateType = ComponentStateType.AtWork;

    this.changeState(nextState);

    this.dataSource$.pipe(
      take(1),
    ).subscribe((data: TD[]) => {
      if(this._firstCheck && data && data.length === 0) {
        this.changeState(ComponentStateType.NoData);
        this._firstCheck = false;
        return;
      }

      if(data) {
        // If there is params bypassed by url - parse them
        if(filter && filterAction) {
          data = filterAction(filter, data);
          nextState = data instanceof Array && data.length === 0 ? ComponentStateType.NoData : ComponentStateType.Still;
        }
        else {
          switch(data.length) {
            case 0: {
              nextState = ComponentStateType.NoData;
            }break;
            default: {
              nextState = ComponentStateType.Still;
            }break;
          }
        }

        if(this.displayedDataLimit) {
          this.displayedDataOverflow = data.length > this.displayedDataLimit;
          data = data.slice(0, this.displayedDataLimit);
        }

        if(afterEffect) {
          afterEffect(data);
        }
      }
      else {
        nextState = ComponentStateType.NoData;
      }
      this.setDisplayedData(data);
      this.changeState(nextState);
    });
  }

  //#endregion

  //#region Command methods

  private _actionExecutedStream = new Subject<string>();

  public actionAnnounce$: Observable<string> = this._actionExecutedStream.asObservable();

  /**
   * Announce executed action.
   * @param {string} action Exectued action name
   */
  public announceAction(action: string) {
    this._actionExecutedStream.next(action);
  }

  //#endregion

  /**
   * Close all existing suscriptions.
   */
  public close(): void {
    console.log(`Closing state management subscriptions`);

    console.log(`Closing mode ${this._modeStream.observers.length} subscriptions`);
    this._modeStream.complete();

    console.log(`Closing state ${this._stateStream.observers.length} subscriptions`);
    this._stateStream.complete();

    console.log(`Closing data ${this._dataStream.observers.length} subscriptions`);
    this._dataStream.complete();

    console.log(`Closing diplayedData ${this._displayedDataStream.observers.length} subscriptions`);
    this._displayedDataStream.complete();

    console.log(`Closing actionExecuted ${this._actionExecutedStream.observers.length} subscriptions`);
    this._actionExecutedStream.complete();

    console.log(`Closed intercomponent interactions`);
  }
}

