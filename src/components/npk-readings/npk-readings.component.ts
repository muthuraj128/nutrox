import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Esp32Service, NpkReadings } from '../../services/esp32.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-npk-readings',
  templateUrl: './npk-readings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class NpkReadingsComponent {
  private esp32Service = inject(Esp32Service);

  readings = signal<NpkReadings | null>(null);
  isLoading = signal(false);
  statusMessage = signal('Click "Read" to get soil NPK values.');

  getReadings(): void {
    this.isLoading.set(true);
    this.readings.set(null);
    this.statusMessage.set('Connecting to sensor...');
    
    this.esp32Service.getNpkReadings()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.readings.set(data);
          this.statusMessage.set('Readings successful. Values are in mg/kg (ppm).');
        },
        error: () => {
          this.statusMessage.set('Failed to connect to sensor. Please try again.');
        }
      });
  }
}
