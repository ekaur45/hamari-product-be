import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import Currency from "src/database/entities/currency.entity";
import { Repository } from "typeorm";
import { CurrencyStatus } from "../enums";
import { CreateCurrencyDto } from "src/modules/currency/dto/create-currency.dto";

@Injectable()
export class CurrencyService {
    constructor(
        @InjectRepository(Currency)
        private readonly currencyRepository: Repository<Currency>,
    ) {}

    async list(): Promise<Currency[]> {
        return this.currencyRepository.find({
            where: {
                isDeleted: false
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async getPublicCurrencies(): Promise<Currency[]> {
        return this.currencyRepository.find({
            where: {
                isDeleted: false,
                status: CurrencyStatus.ACTIVE
            },
        });
    }

    async createCurrencyByAdmin(createCurrencyDto: CreateCurrencyDto): Promise<Currency> {
        const existingCurrency = await this.currencyRepository.findOne({
            where: {
                code: createCurrencyDto.code
            },
        });
        if (existingCurrency) {
            throw new BadRequestException('Currency with this code already exists');
        }
        if (createCurrencyDto.isBase) {
            const baseCurrency = await this.currencyRepository.findOne({
                where: {
                    isBase: true
                },
            });
            if (baseCurrency) {
                throw new BadRequestException('Only one base currency is allowed');
            }
        }
        if (createCurrencyDto.exchangeRate <= 0) {
            throw new BadRequestException('Exchange rate must be greater than 0');
        }
        const isThereAnyCurrency = await this.currencyRepository.findOne({
            where: {
                isDeleted: false
            },
        });
        if(!isThereAnyCurrency) {
            createCurrencyDto.isBase = true;
        }
        const currency = this.currencyRepository.create({
            ...createCurrencyDto,
            status: CurrencyStatus.ACTIVE,
            isDeleted: false,
        });
        return this.currencyRepository.save(currency);
    }
}