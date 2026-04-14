import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  list() {
    return this.customersService.list();
  }

  @Get(':nik')
  get(@Param('nik') nik: string) {
    return this.customersService.get(nik);
  }

  @Post()
  create(
    @Body()
    body: {
      nik: string;
      nama: string;
      no_hp?: string | null;
      alamat?: string | null;
    },
  ) {
    return this.customersService.create(body);
  }

  @Patch(':nik')
  update(
    @Param('nik') nik: string,
    @Body()
    body: { nama?: string; no_hp?: string | null; alamat?: string | null },
  ) {
    return this.customersService.update(nik, body);
  }

  @Delete(':nik')
  delete(@Param('nik') nik: string) {
    return this.customersService.delete(nik);
  }
}
