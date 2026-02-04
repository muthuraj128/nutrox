import { Component, ChangeDetectionStrategy, signal, inject, AfterViewInit, ViewChild, ElementRef, OnDestroy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Deficiency } from '../../models';

declare var Chart: any;

@Component({
  selector: 'app-crop-guide',
  templateUrl: './crop-guide.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class CropGuideComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cropNutrientChart') chartCanvas!: ElementRef<HTMLCanvasElement>;

  generateFertilizerForCrop = output<Deficiency[]>();

  private dataService = inject(DataService);
  private chart: any;

  cropsData = this.dataService.getData().crops;
  cropNames = Object.keys(this.cropsData);
  selectedCropName = signal(this.cropNames[0]);

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  selectCrop(event: Event): void {
    const cropName = (event.target as HTMLSelectElement).value;
    this.selectedCropName.set(cropName);
    this.createChart();
  }

  createChart(): void {
    if (!this.chartCanvas) return;

    const crop = this.cropsData[this.selectedCropName()];
    const chartData = {
      labels: Object.keys(crop.needs),
      datasets: [{
        label: 'Relative Requirement',
        data: Object.values(crop.needs),
        backgroundColor: ['#A47E3B', '#C8A572', '#E5D3B3'],
        borderColor: '#FDFBF5',
        borderWidth: 2,
        borderRadius: 5
      }]
    };

    if (this.chart) {
      this.chart.destroy();
    }
    
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: chartData,
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { display: false, max: 3, min: 0 } },
          y: { grid: { display: false }, ticks: { color: '#4F4A45', font: { size: 14 } } }
        }
      }
    });
  }

  onGenerateFertilizer(): void {
    const crop = this.cropsData[this.selectedCropName()];
    const needs = crop.needs as { [key: string]: number };
    const deficiencies: Deficiency[] = [];
    const levelMap: { [key: number]: string } = {
      1: 'Low Need',
      2: 'Medium Need',
      3: 'High Need'
    };

    for (const key in needs) {
        const nutrientMatch = key.match(/\((N|P|K)\)/);
        if (nutrientMatch) {
            const nutrient = nutrientMatch[1] as 'N' | 'P' | 'K';
            const weight = needs[key];
            if (weight > 0) {
                deficiencies.push({
                    nutrient: nutrient,
                    level: levelMap[weight] || 'Custom Need',
                    weight: weight
                });
            }
        }
    }
    this.generateFertilizerForCrop.emit(deficiencies);
  }
}