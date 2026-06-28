import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  IsIn
} from 'class-validator';

export class CreateAlumniDto {
  @IsString()
  @MinLength(2)
  studentName: string;

  @IsString()
  @IsNotEmpty()
  hallTicketNumber: string;

  @IsString()
  @IsNotEmpty()
  branch: string;

  

  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be 10 digits.' })
  mobileNumber: string;

  @IsString()
  @IsIn(['Yes', 'No'])
  willAttend: string;

  @IsString()
  @IsIn(['0', '1', '2', '3', '4'])
  numberOfGuests: string;

  @IsString()
  @IsNotEmpty()
  photo: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
