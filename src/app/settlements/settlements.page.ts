import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoadingController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
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
    
      let partnerId = this.partnerId;
      let hotelName = this.compensationTable[0]['hotelId']['hotelName'];
      let earnings = this.compensationTable;

      this.auth.downloadInvoice(partnerId,hotelName, earnings)
      .subscribe(
        {
          next:async(value:any) =>{
            console.log(value);
            this.openPdfInBrowser(value['url']);
          },
          error:async(error:HttpErrorResponse) =>{
            console.log(error);
            
          }
        }
      )


  }

  async openPdfInBrowser(pdfUrl: string) {
    try {
      await Browser.open({ url: pdfUrl });
    } catch (err) {
      console.error('Failed to open PDF:', err);
    }
  }
}
