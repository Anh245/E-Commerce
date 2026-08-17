import { ApiProperty } from "@nestjs/swagger";
import { Role } from "prisma-client/client";

export class UserResponseDto{
    @ApiProperty({
        description:" User ID",
        example:"123bbfeufs",
    })
    id: string;
    @ApiProperty({
        description: "Email",
        example:"example@gmail.com"
    })
    email: string;
    @ApiProperty({
        description:"first name",
        example:"abc"
    })
    firstName: string;

    @ApiProperty({
        description:"user last name",
        example:"xyz"
    })
    lastName: string;
    @ApiProperty({
        description:"User role",
        example:"USER || ADMIN",
        enum: Role
    })
    role: Role;

    @ApiProperty({
        description:"Account creation date",
    })
    createdAt:Date;

    @ApiProperty({
        description:"last update  date",
    })
    updatedAt:Date;

}