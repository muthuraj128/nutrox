import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Deficiency } from './models';

import { NpkReadingsComponent } from './components/npk-readings/npk-readings.component';
import { TankMonitorComponent } from './components/tank-monitor/tank-monitor.component';
import { FertilizerGeneratorComponent } from './components/fertilizer-generator/fertilizer-generator.component';
import { SoilExplorerComponent } from './components/soil-explorer/soil-explorer.component';
import { CropGuideComponent } from './components/crop-guide/crop-guide.component';
import { ReferencesComponent } from './components/references/references.component';
import { MotorControlComponent } from './components/motor-control/motor-control.component';
import { PlantAnalyserComponent } from './components/plant-analyser/plant-analyser.component';

type Section = 'npk' | 'tank' | 'generator' | 'soils' | 'crops' | 'references' | 'motor' | 'plant';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NpkReadingsComponent,
    TankMonitorComponent,
    FertilizerGeneratorComponent,
    SoilExplorerComponent,
    CropGuideComponent,
    ReferencesComponent,
    MotorControlComponent,
    PlantAnalyserComponent
  ]
})
export class AppComponent implements OnInit {
  activeSection = signal<Section>('npk');
  generatorInitialDeficiencies = signal<Deficiency[] | null>(null);
  generatorSource = signal<'analyser' | 'crop' | null>(null);
  
  // PWA Install Prompt State
  showInstallButton = signal(false);
  private deferredPrompt: any;

  sections: { id: Section, label: string, icon: string }[] = [
    { id: 'npk', label: 'NPK Readings', icon: '🧪' },
    { id: 'tank', label: 'Tank Monitor', icon: '🌡️' },
    { id: 'motor', label: 'Motor Control', icon: '⚡' },
    { id: 'plant', label: 'Plant Analyser', icon: '📸' },
    { id: 'generator', label: 'Fertilizer Gen', icon: '🌿' },
    { id: 'soils', label: 'Soil Explorer', icon: '🌱' },
    { id: 'crops', label: 'Crop Guide', icon: '🌾' },
    { id: 'references', label: 'References', icon: '📚' }
  ];

  ngOnInit(): void {
    // Listen for the PWA install event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      this.showInstallButton.set(true);
    });
  }

  async installPwa(): Promise<void> {
    if (!this.deferredPrompt) {
      return;
    }
    // Show the install prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, discard it
    this.deferredPrompt = null;
    this.showInstallButton.set(false);
  }

  showSection(sectionId: Section): void {
    this.activeSection.set(sectionId);
  }

  handleGenerateFertilizer(deficiencies: Deficiency[]): void {
    this.generatorInitialDeficiencies.set(deficiencies);
    this.generatorSource.set('analyser');
    this.showSection('generator');
  }
  
  handleGenerateFertilizerForCrop(deficiencies: Deficiency[]): void {
    this.generatorInitialDeficiencies.set(deficiencies);
    this.generatorSource.set('crop');
    this.showSection('generator');
  }

  handleResetGenerator(): void {
    this.generatorInitialDeficiencies.set(null);
    this.generatorSource.set(null);
  }
}