import { ComponentRef, Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

interface SideSheetConfig {
  id: string; // Unique identifier
  component: ComponentRef<any>; // Dynamically created component instance
}

@Injectable({
  providedIn: 'root'
})
export class SideSheetService {
  private stack: SideSheetConfig[] = [];
  private stackSubject: BehaviorSubject<SideSheetConfig[]> = new BehaviorSubject<SideSheetConfig[]>([]);

  stackLimit = 3;

  // Expose the observable to subscribers
  get sheets$() {
    return this.stackSubject.asObservable();
  }

  open(id: string, component: ComponentRef<any>) {
    const existingSheet = this.stack.find(sheet => sheet.id === id);
    if (!existingSheet) {
      this.stack.push({ id, component });
      this.updateSheets();
    }
  }

  close(id: string) {
    const index = this.stack.findIndex(sheet => sheet.id === id);
    if (index !== -1) {
      this.stack[index].component.destroy();
      this.stack.splice(index, 1);
      this.updateSheets();
    }
  }

  private updateSheets() {
    // Limit the number of sheets to `stackLimit` and emit the latest stack
    this.stackSubject.next(this.stack.slice(-this.stackLimit));
  }
}
