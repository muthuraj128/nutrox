import { Component, ChangeDetectionStrategy, signal, inject, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

declare var Chart: any;

@Component({
  selector: 'app-soil-explorer',
  templateUrl: './soil-explorer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class SoilExplorerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('soilNutrientChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private dataService = inject(DataService);
  private chart: any;

  soilsData = this.dataService.getData().soils;
  soilNames = Object.keys(this.soilsData);
  selectedSoilName = signal(this.soilNames[0]);

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  selectSoil(soilName: string): void {
    this.selectedSoilName.set(soilName);
    this.createChart();
  }

  createChart(): void {
    if (!this.chartCanvas) return;
    
    const soil = this.soilsData[this.selectedSoilName()];
    const chartData = {
      labels: Object.keys(soil.profile),
      datasets: [{
        label: `${this.selectedSoilName()} Nutrient Levels`,
        data: Object.values(soil.profile),
        backgroundColor: 'rgba(164, 126, 59, 0.2)',
        borderColor: 'rgba(164, 126, 59, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(164, 126, 59, 1)',
      }]
    };

    if (this.chart) {
      this.chart.destroy();
    }
    
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'radar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            angleLines: { color: '#E5E7EB' },
            grid: { color: '#E5E7EB' },
            pointLabels: { font: { size: 12 }, color: '#4F4A45' },
            ticks: { display: false, stepSize: 1, max: 3, min: 0 }
          }
        }
      }
    });
  }
}
