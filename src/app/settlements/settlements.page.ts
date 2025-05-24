import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoadingController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
@Component({
  selector: 'app-settlements',
  templateUrl: './settlements.page.html',
  styleUrls: ['./settlements.page.scss'],
  standalone: false,
})
export class SettlementsPage implements OnInit {
  partnerId: any;
  hotelId: any;
  startDate: any = '';
  endDate: any = '';
  page: any = 1;
  partnerDetails: any = {};
  compensationTable: any[] = [];
  totalSettled = 0;
  totalUnsettled = 0;
  paidStatus: boolean = true;
  selectedItems = new Set<string>();
  totalPartnerPrice = 0;
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingController: LoadingController
  ) {
    this.hotelId = this.route.snapshot.paramMap.get('hotelId');
    this.partnerId = this.route.snapshot.paramMap.get('partnerId');
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.getSettlementsData();
  }

  toggleSettlements(ev: any) {
    console.log(ev.detail.checked);
    this.paidStatus = ev.detail.checked;
    this.getSettlementsData();
  }
  async getSettlementsData() {
    this.auth
      .getPartnerCompensationTable(
        this.hotelId,
        this.startDate,
        this.endDate,
        this.page,
        this.paidStatus
      )
      .subscribe({
        next: async (value: any) => {
          console.log('Settlements Data');

          console.log(value);
          this.compensationTable = value['data'];
          this.calculateEarnings(this.compensationTable);
        },
        error: async (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }

  calculateEarnings(data: any[]) {
    this.totalSettled = 0;
    this.totalUnsettled = 0;

    for (const item of data) {
      if (item.isSettled) {
        this.totalSettled += item.totalPartnerEarning || 0;
      } else {
        this.totalUnsettled += item.totalPartnerEarning || 0;
      }
    }
  }

  convertImageToBase64(url: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = () => resolve('');
      img.src = url;
    });
  }
  async downloadInvoice() {
    const doc = new jsPDF();
    const title = this.paidStatus ? 'Settled Earnings' : 'Unsettled Earnings';

    // 1. Add logo (optional, use base64 or image URL)
    const logoUrl = 'assets/icon/logo.png'; // or remote URL
    const logoDataUrl = await this.convertImageToBase64(logoUrl);
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 10, 10, 40, 20);
    }

    doc.setFontSize(16);
    doc.text(title, 105, 20, { align: 'center' });

    const headers = [['Order ID', 'Dish', 'Qty', 'Price', 'Total', 'Date']];
    const rows = this.compensationTable.map((item) => {
      const orderId = item.orderId?.orderId || '-';
      const dishName = item.dishId?.name || '-';
      const qty = item.quantity;
      const price = `₹${item.partnerPrice}`;
      const total = `₹${item.totalPartnerEarning}`;
      const date = item.settledAt
        ? new Date(item.settledAt).toLocaleString()
        : '-';
      return [orderId, dishName, qty, price, total, date];
    });

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [40, 60, 100] },
    });

    // 2. Add footer with company name
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(12);
    doc.text(
      '© 2025 Dropeat Technologies Private Limited',
      105,
      pageHeight - 10,
      {
        align: 'center',
      }
    );

    // 3. Generate PDF blob and save to file system
    const pdfOutput = doc.output('datauristring');
    const fileName = `${title.replace(
      /\s+/g,
      '_'
    )}_${new Date().getTime()}.pdf`;

    await Filesystem.writeFile({
      path: fileName,
      data: pdfOutput.split(',')[1], // Remove base64 header
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    // 4. Optional: Toast or alert
    alert('Invoice saved to device Documents folder!');
  }
}
