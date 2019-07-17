import { Component } from '@angular/core';

import { trainingSet } from './training-set';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  locations = trainingSet.map(row => row[1]);
}
