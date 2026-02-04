import { Injectable } from '@angular/core';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface NpkReadings {
  n: number;
  p: number;
  k: number;
}

export interface TankReadings {
  methane: number;
  temp: number;
  humidity: number;
  ph: number;
  moisture: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';


@Injectable({ providedIn: 'root' })
export class Esp32Service {
  // Simulate a network delay for mock data
  private readonly SIMULATED_DELAY = 800;
  
  // --- Web Serial API Properties ---
  private port: any; // SerialPort
  private reader: any; // ReadableStreamDefaultReader
  private writer: any; // WritableStreamDefaultWriter
  private keepReading = true;

  private tankDataSubject = new Subject<{ temp: number; humidity: number; methane: number; moisture: number }>();
  public tankData$ = this.tankDataSubject.asObservable();

  private relayStateSubject = new BehaviorSubject<boolean>(false);
  public relayState$ = this.relayStateSubject.asObservable();

  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>('disconnected');
  public connectionStatus$ = this.connectionStatusSubject.asObservable();


  // --- Web Serial API Methods ---
  async connect(): Promise<void> {
    if (!('serial' in navigator)) {
      this.connectionStatusSubject.next('error');
      console.error('Web Serial API not supported.');
      alert('Web Serial API is not supported in your browser.');
      return;
    }

    if (this.port) {
        console.log("A connection attempt is already in progress or established.");
        return;
    }

    try {
      this.connectionStatusSubject.next('connecting');
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 9600 });

      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
      this.writer = textEncoder.writable.getWriter();

      this.connectionStatusSubject.next('connected');
      this.keepReading = true;
      this.readLoop();
    } catch (err) {
      console.error('There was an error opening the serial port:', err);
      this.connectionStatusSubject.next('error');
      this.port = undefined;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.port) return;

    this.keepReading = false;
    
    if (this.writer) {
      try {
        await this.writer.close();
      } catch (error) {
        console.error("Error closing writer:", error);
      }
    }

    if (this.reader) {
        try {
            await this.reader.cancel();
        } catch(error) {
            console.error("Error cancelling reader:", error);
        }
    }
  }

  async sendCommand(command: string): Promise<void> {
    if (!this.writer) {
      console.error('Serial port not writable.');
      return;
    }
    try {
      await this.writer.write(command + '\n');
    } catch (error) {
      console.error('Error writing to serial port:', error);
    }
  }
  
  private async readLoop(): Promise<void> {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    this.reader = textDecoder.readable.getReader();
    let partialData = '';

    while (this.port.readable && this.keepReading) {
      try {
        const { value, done } = await this.reader.read();
        if (done) {
          break;
        }

        partialData += value;
        let newlineIndex;
        while ((newlineIndex = partialData.indexOf('\n')) >= 0) {
            const jsonString = partialData.substring(0, newlineIndex).trim();
            partialData = partialData.substring(newlineIndex + 1);

            if (jsonString) {
                try {
                    const data = JSON.parse(jsonString);
                    // Check for complete sensor data packet from Arduino
                    if (data.temp !== undefined && data.hum !== undefined && data.gas !== undefined && data.moist !== undefined && data.relay !== undefined) {
                      this.tankDataSubject.next({
                        temp: data.temp,
                        humidity: data.hum,
                        methane: data.gas,
                        moisture: data.moist
                      });
                      this.relayStateSubject.next(data.relay === 'ON');
                    } else if (data.error) {
                      console.error('Error from Arduino:', data.error);
                    } else if (data.status) {
                      console.log('Status from Arduino:', data.status);
                    }
                } catch (e) {
                    console.warn('Could not parse JSON from serial port:', jsonString);
                }
            }
        }
      } catch (error) {
        console.error('Error reading from serial port:', error);
        this.keepReading = false;
      }
    }
    
    this.reader.releaseLock();
    await readableStreamClosed.catch(() => { /* Ignore cancellation error */ });
    
    try {
      await this.port.close();
    } catch(error) {
       console.error("Error closing port:", error);
    } finally {
       this.port = undefined;
       this.reader = undefined;
       this.writer = undefined;
       this.connectionStatusSubject.next('disconnected');
       this.relayStateSubject.next(false);
    }
  }

  // --- Mock Data Methods ---
  getNpkReadings(): Observable<NpkReadings> {
    const readings: NpkReadings = {
      n: this.getRandomValue(30, 90),  // Simulate deficient nitrogen
      p: this.getRandomValue(120, 180), // Simulate sufficient phosphorus
      k: this.getRandomValue(20, 60),  // Simulate deficient potassium
    };
    return of(readings).pipe(delay(this.SIMULATED_DELAY));
  }
  
  getPhReading(): Observable<{ph: number}> {
      const phReading = {
          ph: parseFloat(this.getRandomValue(6.5, 7.2).toFixed(1))
      };
      return of(phReading).pipe(delay(200));
  }

  // Original mock method remains for potential other uses
  getTankReadings(): Observable<TankReadings> {
    const readings: TankReadings = {
      methane: parseFloat(this.getRandomValue(3, 8).toFixed(2)),
      temp: parseFloat(this.getRandomValue(25, 35).toFixed(1)),
      humidity: parseFloat(this.getRandomValue(60, 85).toFixed(1)),
      ph: parseFloat(this.getRandomValue(6.5, 7.2).toFixed(1)),
      moisture: parseFloat(this.getRandomValue(50, 75).toFixed(1)),
    };
    return of(readings).pipe(delay(this.SIMULATED_DELAY));
  }

  private getRandomValue(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}