import { Component, ChangeDetectionStrategy, signal, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Esp32Service, ConnectionStatus } from '../../services/esp32.service';
import { Subscription } from 'rxjs';

interface RealtimeReadings {
  temp: number;
  humidity: number;
  methane: number;
  moisture: number;
}

@Component({
  selector: 'app-tank-monitor',
  templateUrl: './tank-monitor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class TankMonitorComponent implements OnInit, OnDestroy {
  private esp32Service = inject(Esp32Service);
  private subscriptions = new Subscription();

  realtimeReadings = signal<RealtimeReadings | null>(null);
  phReading = signal<{ ph: number } | null>(null);
  connectionStatus = signal<ConnectionStatus>('disconnected');
  statusMessage = signal('Connect to an Arduino device to get real-time sensor data.');

  ngOnInit(): void {
    const statusSub = this.esp32Service.connectionStatus$.subscribe(status => {
      this.connectionStatus.set(status);
      this.updateStatusMessage(status);
      if (status === 'connected') {
        this.getPh(); // Get mock pH once connected
      } else {
        this.realtimeReadings.set(null); // Clear readings on disconnect or error
        this.phReading.set(null);
      }
    });

    const dataSub = this.esp32Service.tankData$.subscribe(data => {
      this.realtimeReadings.set(data);
    });

    this.subscriptions.add(statusSub);
    this.subscriptions.add(dataSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    // Ensure disconnect is called if component is destroyed while connected
    if (this.connectionStatus() === 'connected' || this.connectionStatus() === 'connecting') {
      this.esp32Service.disconnect();
    }
  }

  connect(): void {
    this.esp32Service.connect();
  }

  disconnect(): void {
    this.esp32Service.disconnect();
  }

  private getPh(): void {
      this.esp32Service.getPhReading().subscribe(data => {
          this.phReading.set(data);
      });
  }

  private updateStatusMessage(status: ConnectionStatus): void {
    switch (status) {
      case 'disconnected':
        this.statusMessage.set('Connect to an Arduino device to get real-time sensor data.');
        break;
      case 'connecting':
        this.statusMessage.set('Connecting... Please select a serial port from the popup.');
        break;
      case 'connected':
        this.statusMessage.set('Receiving real-time data from the device.');
        break;
      case 'error':
        this.statusMessage.set('Connection failed. Please ensure the device is plugged in and that other applications (like the Arduino Serial Monitor) are closed. Then, try again.');
        break;
    }
  }
}