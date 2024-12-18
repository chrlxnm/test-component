import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { SideSheetService } from './sidesheet.service';

interface SideSheetConfig {
  id: string;
  component: ComponentRef<any>;
}

@Component({
  selector: 'app-sidesheet',
  standalone: true,
  imports: [CommonModule],
  template: `<div #container></div>`,
  styleUrls: ['./sidesheet.component.scss'],
})
export class SideSheetComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() sheets: SideSheetConfig[] = [];
  @ViewChild('container', { read: ElementRef, static: true })
  container!: ElementRef;

  private renderedComponents: HTMLElement[] = [];
  private backdropEl: HTMLElement | null = null; // Backdrop reference
  private isRendering = false; // Prevents recursive calls

  constructor(
    private renderer: Renderer2,
    private sideSheetService: SideSheetService
  ) {}

  ngOnInit() {
    // Subscribe to the sheets observable
    this.sideSheetService.sheets$.subscribe((sheets) => {
      this.sheets = sheets;
      this.updateSheets(); // Update the stack when sheets change
    });
  }

  ngAfterViewInit() {
    this.updateSheets();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sheets'] && !this.isRendering) {
      this.updateSheets();
    }
  }

  ngOnDestroy() {
    this.cleanupSheets();
  }

  private updateSheets() {
    // Prevent multiple rendering cycles
    this.isRendering = true;
    const containerEl = this.container.nativeElement;

    // Reverse the stack to render the latest sheet on top
    const reversedSheets = [...this.sheets].reverse();

    if (!this.sheets.length) {
      if (document.body.contains(this.backdropEl)) {
        this.renderer.removeChild(document.body, this.backdropEl);
        this.backdropEl = null;
      }
    }
    console.log("ADD", reversedSheets, this.renderedComponents,containerEl)

    reversedSheets.forEach((sheet, reverseIndex) => {
      const componentEl = sheet.component.location.nativeElement;

      // If the component is already rendered, just update its styles with transitions
      if (!this.renderedComponents.includes(componentEl)) {
        this.renderer.setStyle(componentEl, 'position', 'fixed');
        this.renderer.setStyle(
          componentEl,
          'top',
          `${24 * (reverseIndex + 1)}px`
        );
        this.renderer.setStyle(componentEl, 'border-radius', '16px');
        this.renderer.setStyle(componentEl, 'background-color', 'white');

        // Calculate the right position dynamically based on stack index
        this.renderer.setStyle(
          componentEl,
          'right',
          `${48 * reverseIndex + 10}px`
        );

        // Calculate the height dynamically based on stack index
        this.renderer.setStyle(
          componentEl,
          'height',
          `calc(100vh - ${40 * (reverseIndex + 1) + 24}px)`
        );

        // Set width to fixed value
        this.renderer.setStyle(componentEl, 'min-width', '580px');
        this.renderer.setStyle(componentEl, 'width', '40vw');

        // Move the component off-screen initially
        this.renderer.setStyle(componentEl, 'margin-right', '-580px');
        this.renderer.setStyle(
          componentEl,
          'box-shadow',
          '-2px 0 10px rgba(0, 0, 0, 0.3)'
        );
        this.renderer.setStyle(
          componentEl,
          'z-index',
          `${1000 + reverseIndex}`
        );

        // Add initial "closed" class to apply the off-screen margin-right
        this.renderer.addClass(componentEl, 'side-sheet-closed');

        // Append to container
        this.renderer.appendChild(containerEl, componentEl);
        this.renderedComponents.push(componentEl);
        console.log("ADD", reversedSheets, this.renderedComponents)

        // Apply backdrop if it's the first side sheet
        if (!this.backdropEl) {
          this.createBackdrop();
        }

        // Ensure that the initial styles are applied first
        requestAnimationFrame(() => {
          // Apply transition after the first layout pass
          this.renderer.setStyle(
            componentEl,
            'transition',
            'margin-right 0.3s ease, top 0.3s ease, height 0.3s ease, right 0.3s ease'
          );

          // Now move to 0px
          requestAnimationFrame(() => {
            this.renderer.setStyle(componentEl, 'margin-right', '0px');
          });
        });
      } else {
        console.log("NOADD", reversedSheets, this.renderedComponents)
        const frontdropEl = this.renderer.createElement('div');
        this.renderer.setStyle(frontdropEl, 'position', 'fixed');
        this.renderer.setStyle(
          frontdropEl,
          'top',
          `${24 * (reverseIndex + 1)}px`
        );
        this.renderer.setStyle(
          frontdropEl,
          'right',
          `calc(${5 * reverseIndex}vw + 10px)`
        );
        this.renderer.setStyle(frontdropEl, 'opacity', `0`);
        this.renderer.setStyle(frontdropEl, 'min-width', '580px');
        this.renderer.setStyle(frontdropEl, 'width', '40vw');
        this.renderer.setStyle(
          frontdropEl,
          'height',
          `calc(100vh - ${40 * (reverseIndex + 1) + 24}px)`
        );
        this.renderer.setStyle(
          frontdropEl,
          'background-color',
          'rgba(0, 0, 0, 0.3)'
        );
        this.renderer.setStyle(frontdropEl, 'border-radius', '16px');
        this.renderer.setStyle(
          frontdropEl,
          'z-index',
          `${1000 + reverseIndex - 1}`
        ); // Behind the current sheet
        this.renderer.setStyle(frontdropEl, 'transition', 'opacity 0.3s ease');
        setTimeout(() => {
          this.renderer.setStyle(frontdropEl, 'opacity', `1`);
        }, 100);

        // Remove any previous frontdropEl for this sheet if it was moved to the top
        if (reverseIndex === 0) {
          const prevFrontdropEl = componentEl.querySelector('.frontdrop');
          if (prevFrontdropEl) {
            this.renderer.removeChild(componentEl, prevFrontdropEl);
          }
        } else {
          // Append the frontdrop
          this.renderer.insertBefore(
            componentEl,
            frontdropEl,
            componentEl.firstChild
          );
        }

        // If the component is already rendered, just update its dynamic styles with transitions
        this.renderer.setStyle(
          componentEl,
          'transition',
          'top 0.3s ease, height 0.3s ease, right 0.3s ease'
        );
        this.renderer.setStyle(
          componentEl,
          'top',
          `${24 * (reverseIndex + 1)}px`
        );
        this.renderer.setStyle(
          componentEl,
          'right',
          `calc(${5 * reverseIndex}vw + 10px)`
        );
        this.renderer.setStyle(
          componentEl,
          'height',
          `calc(100vh - ${40 * (reverseIndex + 1) + 24}px)`
        );

        // Mark frontdrop element
        frontdropEl.classList.add('frontdrop');
      }
    });

    this.isRendering = false; // Allow further rendering once done
  }

  private createBackdrop() {
    if (!this.backdropEl) {
      // Create backdrop element
      this.backdropEl = this.renderer.createElement('div');
      this.renderer.setStyle(this.backdropEl, 'position', 'fixed');
      this.renderer.setStyle(this.backdropEl, 'top', '0');
      this.renderer.setStyle(this.backdropEl, 'left', '0');
      this.renderer.setStyle(this.backdropEl, 'width', '100vw');
      this.renderer.setStyle(this.backdropEl, 'height', '100vh');
      this.renderer.setStyle(
        this.backdropEl,
        'background-color',
        'rgba(0, 0, 0, 0.5)'
      );
      this.renderer.setStyle(this.backdropEl, 'z-index', '999'); // Ensure backdrop is behind the sheets
      this.renderer.setStyle(
        this.backdropEl,
        'transition',
        'opacity 0.3s ease'
      );

      // Append backdrop to the body or container
      this.renderer.appendChild(document.body, this.backdropEl);
    }

    // Fade in the backdrop
    this.renderer.setStyle(this.backdropEl, 'opacity', '1');
  }

  private cleanupSheets() {
    const containerEl = this.container.nativeElement;

    this.renderedComponents.forEach((el) => {
      try {
        // Apply closing transition before removing the element
        if (containerEl.contains(el)) {
          this.renderer.setStyle(el, 'transition', 'margin-right 0.3s ease, opacity 0.3s ease');
          this.renderer.setStyle(el, 'opacity', '0'); // Fade out
          setTimeout(() => {
            this.renderer.setStyle(el, 'margin-right', '-580px'); // Move out of view
          }, 0);

          // Wait for the transition to complete before removing
          setTimeout(() => {
            if (containerEl.contains(el)) {
              // Remove the element after the transition
              this.renderer.removeChild(containerEl, el);
            }
          }, 300); // Match the duration of the transition
        }
      } catch (error) {
        console.error('Failed to remove child:', el, error);
      }
    });

    // Remove backdrop if there are no more side sheets
    if (this.renderedComponents.length === 0 && this.backdropEl) {
      this.renderer.setStyle(this.backdropEl, 'transition', 'opacity 0.3s ease');
      this.renderer.setStyle(this.backdropEl, 'opacity', '0'); // Fade out backdrop
      setTimeout(() => {
        if (this.backdropEl) {
          this.renderer.removeChild(document.body, this.backdropEl);
          this.backdropEl = null;
        }
      }, 300); // Match the transition duration
    }

    this.renderedComponents = []; // Reset the array after cleanup
  }

}
