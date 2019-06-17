import {AfterViewInit,  ComponentRef, Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { TooltipComponent } from './tooltip.component';

@Directive({ selector: '[appTooltip]' })
export class TooltipDirective implements OnInit, AfterViewInit {

  @Input('appTooltip') text;

  private overlayRef: OverlayRef;

  constructor(private overlay: Overlay,
              private overlayPositionBuilder: OverlayPositionBuilder,
              private elementRef: ElementRef) {
  }

  public ngAfterViewInit () {
  }

  ngOnInit(): void {
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([{
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -8,
      }]);

    this.overlayRef = this.overlay.create({ positionStrategy });
  }



  @HostListener('mouseover')
  show() {
    if (!this.overlayRef.hasAttached()) {
      const portal = new ComponentPortal(TooltipComponent);
      const tooltipRef: ComponentRef<TooltipComponent> = this.overlayRef.attach(portal);

      // next line doesn't work with angular elements, so use innerText as well
      tooltipRef.instance.text = this.text;
      const elm = document.getElementById('app-tooltip');
      elm.innerText = this.text;

      this.overlayRef.updatePosition();
    }
  }

  @HostListener('mouseout')
  hide() {
    if (this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }

  }
}
