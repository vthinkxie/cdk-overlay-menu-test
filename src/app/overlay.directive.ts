// 0. withFlexibleDimensions false 可行性
// 1. init animation position
// 2. withScrollableContainers
// 3. dispose
// 4. extract to service
import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import { ConnectedOverlayPositionChange, ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { OverlayContentComponent } from './overlay-content/overlay-content.component';
import { EMPTY, Observable, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
export const POSITION_MAP: { [key: string]: ConnectionPositionPair } = {
  top: new ConnectionPositionPair({ originX: 'center', originY: 'top' }, { overlayX: 'center', overlayY: 'bottom' }),
  topCenter: new ConnectionPositionPair({ originX: 'center', originY: 'top' }, { overlayX: 'center', overlayY: 'bottom' }),
  topLeft: new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'bottom' }),
  topRight: new ConnectionPositionPair({ originX: 'end', originY: 'top' }, { overlayX: 'end', overlayY: 'bottom' }),
  right: new ConnectionPositionPair({ originX: 'end', originY: 'center' }, { overlayX: 'start', overlayY: 'center' }),
  rightTop: new ConnectionPositionPair({ originX: 'end', originY: 'top' }, { overlayX: 'start', overlayY: 'top' }),
  rightBottom: new ConnectionPositionPair({ originX: 'end', originY: 'bottom' }, { overlayX: 'start', overlayY: 'bottom' }),
  bottom: new ConnectionPositionPair({ originX: 'center', originY: 'bottom' }, { overlayX: 'center', overlayY: 'top' }),
  bottomCenter: new ConnectionPositionPair({ originX: 'center', originY: 'bottom' }, { overlayX: 'center', overlayY: 'top' }),
  bottomLeft: new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' }),
  bottomRight: new ConnectionPositionPair({ originX: 'end', originY: 'bottom' }, { overlayX: 'end', overlayY: 'top' }),
  left: new ConnectionPositionPair({ originX: 'start', originY: 'center' }, { overlayX: 'end', overlayY: 'center' }),
  leftTop: new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'end', overlayY: 'top' }),
  leftBottom: new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'end', overlayY: 'bottom' })
};
export const DEFAULT_DROPDOWN_POSITIONS = [POSITION_MAP.bottomLeft, POSITION_MAP.bottomRight, POSITION_MAP.topLeft, POSITION_MAP.topRight];

export function getPlacementName(position: ConnectedOverlayPositionChange): 'bottom' | 'top' | undefined {
  const { connectionPair } = position;
  if (connectionPair.originY === 'top' && connectionPair.overlayY === 'bottom') {
    return 'top';
  } else if (connectionPair.originY === 'bottom' && connectionPair.overlayY === 'top') {
    return 'bottom';
  }
  return undefined;
}

@Directive({
  selector: '[appOverlay]'
})
export class OverlayDirective implements AfterViewInit, OnDestroy, OnInit, OnChanges {
  @Input() overlayContentComponent: OverlayContentComponent;
  @Input() visible = false;
  private destroy$ = new Subject();
  private changes$ = new ReplaySubject<SimpleChanges>(1);
  private position$: Observable<'bottom' | 'top' | undefined> = EMPTY;
  overlayRef: OverlayRef | null = null;
  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
  ) {
    const strategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withLockedPosition()
      .withTransformOriginOn('.ant-dropdown-trigger')
      .withFlexibleDimensions(false)
      .withPositions(DEFAULT_DROPDOWN_POSITIONS);
    this.overlayRef = this.overlay.create({
      positionStrategy: strategy,
      panelClass: 'ant-dropdown',
      hasBackdrop: false,
      disposeOnNavigation: true,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
    this.position$ = strategy.positionChanges.pipe(
      map(p => getPlacementName(p)),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );
  }
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const visible$ = this.changes$.pipe(
      filter(c => !!c.visible),
      map(c => c.visible.currentValue)
    );
    visible$.pipe(takeUntil(this.destroy$)).subscribe(visible => {
      if (visible) {
        this.overlayRef.attach(new TemplatePortal(this.overlayContentComponent.templateRef, this.viewContainerRef));
      } else {
        this.overlayRef.detach();
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.changes$.next(changes);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
