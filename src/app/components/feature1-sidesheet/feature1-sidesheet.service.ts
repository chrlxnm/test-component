// feature1-sidesheet.service.ts

import {
  ApplicationRef,
  ComponentFactoryResolver,
  Injectable,
  Injector,
} from '@angular/core';

import { Feature1SidesheetComponent } from './feature1-sidesheet.component';
import { SideSheetService } from '../sidesheet/sidesheet.service';

@Injectable({
  providedIn: 'root'
})
export class Feature1SideSheetService {
  private listComp = [
    { id: 'feature1', component: Feature1SidesheetComponent },
    { id: 'feature2', component: Feature1SidesheetComponent },
    { id: 'feature3', component: Feature1SidesheetComponent },
    { id: 'feature4', component: Feature1SidesheetComponent },
  ];

  constructor(
    private sideSheetService: SideSheetService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  open<C>(id: string, data?: Partial<C>) {
    const target = this.listComp.find(item => item.id === id);
    if (!target) {
      console.error(`Component with ID "${id}" not found in listComp.`);
      return;
    }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(target.component);
    const componentRef = componentFactory.create(this.injector);

    Object.assign(componentRef.instance, data);

    this.appRef.attachView(componentRef.hostView);
    this.sideSheetService.open(id, componentRef);
  }

  close(id: string) {
    this.sideSheetService.close(id);
  }
}
