import { Component, ChangeDetectionStrategy, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Esp32Service, ConnectionStatus } from '../../services/esp32.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-motor-control',
  templateUrl: './motor-control.component.html',
  styleUrls: ['./motor-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class MotorControlComponent implements OnInit, OnDestroy {
  private esp32Service = inject(Esp32Service);
  private subscription = new Subscription();
  
  motorOn = signal(false);
  connectionStatus = signal<ConnectionStatus>('disconnected');
  statusMessage = signal('Connect to an Arduino device to send commands.');
  motorHistory = signal<{ timestamp: Date, state: 'ON' | 'OFF' }[]>([]);
  
  ngOnInit(): void {
    const statusSub = this.esp32Service.connectionStatus$.subscribe(status => {
      this.connectionStatus.set(status);
      this.updateStatusMessage(status);
      if (status !== 'connected') {
        this.motorOn.set(false); // Reset motor state on disconnect
      }
    });

    const relaySub = this.esp32Service.relayState$.subscribe(state => {
      this.motorOn.set(state);
      this.recordMotorState(state);
    });

    this.subscription.add(statusSub);
    this.subscription.add(relaySub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleMotor(): void {
    if (this.connectionStatus() !== 'connected') return;
    
    const command = !this.motorOn() ? 'RELAY_ON' : 'RELAY_OFF';
    this.esp32Service.sendCommand(command);
  }

  connect(): void {
    this.esp32Service.connect();
  }

  disconnect(): void {
    this.esp32Service.disconnect();
  }
  
  clearHistory(): void {
    this.motorHistory.set([]);
  }

  private recordMotorState(isOn: boolean): void {
    if (this.connectionStatus() !== 'connected') {
      return; // Do not record history when not connected
    }

    const newState: 'ON' | 'OFF' = isOn ? 'ON' : 'OFF';
    const lastState = this.motorHistory()[0]?.state;

    if (newState !== lastState) {
        const newEntry: { timestamp: Date; state: 'ON' | 'OFF' } = {
            timestamp: new Date(),
            state: newState
        };
        this.motorHistory.update(history => [newEntry, ...history]);
    }
  }

  private updateStatusMessage(status: ConnectionStatus): void {
    switch (status) {
      case 'disconnected':
        this.statusMessage.set('Connect to an Arduino device to send commands.');
        break;
      case 'connecting':
        this.statusMessage.set('Connecting... Please select a serial port from the popup.');
        break;
      case 'connected':
        this.statusMessage.set('Device connected. Ready to send commands.');
        break;
      case 'error':
        this.statusMessage.set('Connection failed. Please ensure the device is plugged in and that other applications (like the Arduino Serial Monitor) are closed. Then, try again.');
        break;
    }
  }
}