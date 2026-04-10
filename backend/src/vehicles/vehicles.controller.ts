import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  list() {
    return this.vehiclesService.list();
  }

  @Get(':no_rangka')
  get(@Param('no_rangka') no_rangka: string) {
    return this.vehiclesService.get(no_rangka);
  }

  @Post()
  create(
    @Body()
    body: {
      no_rangka: string;
      plat_nomor: string;
      jenis_mobil?: string | null;
      warna?: string | null;
      tahun?: number | null;
      kilometer: number;
      nik_pemilik: string;
    },
  ) {
    return this.vehiclesService.create(body);
  }

  @Patch(':no_rangka')
  update(
    @Param('no_rangka') no_rangka: string,
    @Body()
    body: {
      plat_nomor?: string;
      jenis_mobil?: string | null;
      warna?: string | null;
      tahun?: number | null;
      kilometer?: number;
      nik_pemilik?: string;
    },
  ) {
    return this.vehiclesService.update(no_rangka, body);
  }

  @Delete(':no_rangka')
  delete(@Param('no_rangka') no_rangka: string) {
    return this.vehiclesService.delete(no_rangka);
  }
}
