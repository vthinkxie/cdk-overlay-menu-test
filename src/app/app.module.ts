import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { OverlayDirective } from './overlay.directive';
import { OverlayContentComponent } from './overlay-content/overlay-content.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [AppComponent, OverlayDirective, OverlayContentComponent],
  imports: [BrowserModule, OverlayModule, ScrollingModule, BrowserAnimationsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
