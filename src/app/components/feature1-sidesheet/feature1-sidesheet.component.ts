import { Component, Input, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Feature1SideSheetService } from './feature1-sidesheet.service';

@Component({
  selector: 'app-feature1-sidesheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature1-sidesheet.component.html',
  styleUrl: './feature1-sidesheet.component.scss'
})
export class Feature1SidesheetComponent implements OnInit {
  @Input() data!: any; // Receive data dynamically

  ngOnInit(): void {
      console.log("CEKKK", this.data)
  }
  constructor(
    private feature1Service: Feature1SideSheetService
  ) {}
  openFeature() {
    this.feature1Service.open('feature2', {
    title: "HEHEHE"+'feature2'
    });
  }
  closeFeature() {
    this.feature1Service.close('feature2');
  }
  close() {
    this.feature1Service.close('feature1');
  }
}
