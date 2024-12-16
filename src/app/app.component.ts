// app.component.ts

import { Component, ViewChild, ViewContainerRef } from '@angular/core';

import { Feature1SideSheetService } from './components/feature1-sidesheet/feature1-sidesheet.service';
import { Feature1SidesheetComponent } from './components/feature1-sidesheet/feature1-sidesheet.component';
import { SideSheetComponent } from './components/sidesheet/sidesheet.component';
import { SideSheetService } from './components/sidesheet/sidesheet.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SideSheetComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  @ViewChild('dynamicContainer', { read: ViewContainerRef, static: true })
  dynamicContainer!: ViewContainerRef;
  isOpen = false;

  constructor(
    public sharedSideSheetService: SideSheetService,
    private feature1Service: Feature1SideSheetService
  ) {}


  openFeature(id: string) {
    this.feature1Service.open(id, {
    title: "HEHEHE"+id
    });
  }

  close(){
    this.feature1Service.close('feature1')
  }

}
