import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-overlay-content',
  exportAs: 'overlayContent',
  templateUrl: './overlay-content.component.html',
  styleUrls: ['./overlay-content.component.css']
})
export class OverlayContentComponent implements OnInit {
  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  constructor() {}

  ngOnInit() {}
}
