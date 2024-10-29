import { Component } from '@angular/core';
import { AsideComponent } from './aside/aside.component';
import { SectionComponent } from './section/section.component';

@Component({
    selector: 'app-main-content',
    standalone: true,
    imports: [
        AsideComponent,
        SectionComponent
    ],
    templateUrl: './main-content.component.html',
    styleUrl: './main-content.component.css',
})
export class MainContentComponent {}
