import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettlementsPageRoutingModule } from './settlements-routing.module';

import { SettlementsPage } from './settlements.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettlementsPageRoutingModule
  ],
  declarations: [SettlementsPage]
})
export class SettlementsPageModule {}
