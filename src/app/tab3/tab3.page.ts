import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoadingController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page {
  products: any[] = [];
  hotels: any[] = [];
  hotelId: any;
  selectedHotel: any;
  constructor(
    private auth: AuthService,
    private loadingController: LoadingController,
    private router:Router
  ) {}

  ionViewDidEnter() {
    this.getAllHotels();
  }

  loadProductsEvent(ev: any) {
    console.log(ev.detail.value);
    this.getAllProducts(ev.detail.value);
  }

  goToAddProductPage(){
    this.router.navigate(['products']);
  }

  getAllProducts(hotelId: any) {
    this.auth.getAllHotelProductsById(hotelId).subscribe({
      next: async (value: any) => {
        console.log(value);

        let tranformedProducts = this.transformData(value['data']['content']);
        console.log(tranformedProducts);
        this.products = tranformedProducts;
      },
      error: async (error: HttpErrorResponse) => {
        console.log(error.error);
      },
    });
  }

  edit() {}

  stockChangeEvent(ev: any, dishId: any) {
    console.log(ev.detail.checked);
    console.log(dishId);

    let stock = 0;
    if (ev.detail.checked == true) {
      stock = 1;
    } else if (ev.detail.checked == false) {
      stock = 0;
    }
    this.auth.markDishStockStatus(stock, dishId).subscribe({
      next: async (value: any) => {
        console.log(value);
      },
      error: async (error: HttpErrorResponse) => {
        console.log(error.error);
      },
    });
  }
  transformData(data: any) {
    const categoryMap: any = {};

    data.forEach((item: any) => {
      const categoryId = item.categoryId._id;

      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          categoryId: item.categoryId,
          products: [],
        };
      }

      categoryMap[categoryId].products.push({
        name: item.name,
        image_url: item.image_url,
        local_imagePath: item.local_imagePath,
        dishType: item.dishType,
        partnerPrice: item.partnerPrice,
        userPrice: item.userPrice,
        spicLevel: item.spicLevel,
        timeToPrepare: item.timeToPrepare,
        stock: item.stock,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        _id: item._id,
      });
    });

    return Object.values(categoryMap);
  }

  async getAllHotels() {
    let loading = await this.loadingController.create({
      message: 'loading...',
      duration: 3000,
    });

    await loading.present();

    this.auth.getAllHotelsPartner().subscribe({
      next: async (value: any) => {
        console.log(value);
        console.log('hotels');

        this.hotels = value['data'];
        this.selectedHotel = value['data'][0]['_id'];
        this.getAllProducts(this.selectedHotel);
        await loading.dismiss();
      },
      error: async (error: HttpErrorResponse) => {
        console.log(error);
        await loading.dismiss();
      },
    });
  }
}
