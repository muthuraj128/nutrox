import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryItem } from '../../services/gallery.service';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ImageGalleryComponent {
  items = input.required<GalleryItem[]>();

  view = output<GalleryItem>();
  reanalyze = output<GalleryItem>();
  delete = output<number>();
  back = output<void>();

  onView(item: GalleryItem): void {
    this.view.emit(item);
  }

  onReanalyze(item: GalleryItem, event: MouseEvent): void {
    event.stopPropagation();
    this.reanalyze.emit(item);
  }

  onDelete(id: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent triggering view
    if (confirm('Are you sure you want to delete this analysis?')) {
      this.delete.emit(id);
    }
  }

  onBack(): void {
    this.back.emit();
  }
}
