import * as z from 'zod';

export const contractorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório."),
  cpfCnpj: z.string().min(1, "CPF/CNPJ é obrigatório."),
  address: z.string().min(1, "Endereço é obrigatório."),
  email: z.string().email("E-mail inválido."),
});

export type Contractor = z.infer<typeof contractorSchema>;

// Schema para um cliente individual
export const clientSchema = z.object({
  id: z.string(), // ID will come from the client-side
  name: z.string().min(1, "O nome do cliente é obrigatório."),
  cpfCnpj: z.string().min(1, "O CPF/CNPJ é obrigatório."),
  address: z.string().min(1, "O endereço é obrigatório."),
  email: z.string().email("O e-mail fornecido é inválido."),
  createdAt: z.string().optional(), // ISO date string
});

export type Client = z.infer<typeof clientSchema>;


export type ServiceType =
  | 'Produção de Vídeo'
  | 'Edição de Vídeo'
  | 'Website'
  | 'Drone'
  | 'Desenvolvimento de Software'
  | 'Motion Graphics';

export type ServiceInclusion = 'Apenas Vídeo' | 'Vídeo e Fotos';

export const serviceContractSchema = z.object({
  serviceType: z.string().min(1),
  serviceInclusion: z.string().optional(),
  contractTitle: z.string().min(1),
  contractors: z.array(contractorSchema).min(1, "Adicione pelo menos um contratante."),
  object: z.string().min(1, "Objeto do contrato é obrigatório."),
  videoCount: z.number().optional(),
  photoCount: z.number().optional(),
  totalValue: z.number().positive("Valor deve ser maior que zero."),
  paymentMethod: z.enum(['À vista', 'Sinal + Entrega', 'Outro']),
  paymentSignalPercentage: z.number().optional(),
  paymentMethodOther: z.string().optional(),
  deliveryDeadline: z.string().min(1, "Prazo de entrega é obrigatório."),
  contractorResponsibilities: z.string().min(1, "Responsabilidades da contratada são obrigatórias."),
  clientResponsibilities: z.string().min(1, "Responsabilidades do contratante são obrigatórias."),
  copyright: z.string().min(1, "Cláusula de direitos autorais é obrigatória."),
  rescissionNoticePeriod: z.number(),
  rescissionFine: z.number(),
  generalDispositions: z.string().min(1, "As disposições gerais são obrigatórias."),
  warranty: z.string().optional(),
  specifications: z.string().optional(),
  jurisdiction: z.string().min(1, "Foro é obrigatório."),
  signatureCity: z.string().min(1, "Cidade da assinatura é obrigatória."),
  signatureDate: z.string().min(1, "Data da assinatura é obrigatória."),
});

export type ServiceContractData = z.infer<typeof serviceContractSchema>;

export const authorizationTermSchema = z.object({
  authorizedName: z.string().min(1, "Nome do autorizado é obrigatório."),
  authorizedCpfCnpj: z.string().min(1, "CPF/CNPJ do autorizado é obrigatório."),
  authorizedAddress: z.string().min(1, "Endereço do autorizado é obrigatório."),
  authorizedEmail: z.string().email("E-mail inválido."),
  projectName: z.string().min(1, "Nome do projeto é obrigatório."),
  finalClient: z.string().min(1, "Cliente final é obrigatório."),
  executionDate: z.string().min(1, "Data de execução é obrigatória."),
  authorizedLinks: z.string().min(1, "Pelo menos um link é obrigatório."),
  permissionsAndProhibitions: z.string().min(1, "A cláusula de permissões é obrigatória."),
  fineValue: z.number().min(0, "O valor da multa não pode ser negativo."),
  generalDispositions: z.string().optional(),
  jurisdiction: z.string().min(1, "Foro é obrigatório."),
  signatureCity: z.string().min(1, "Cidade da assinatura é obrigatória."),
  signatureDate: z.string().min(1, "Data da assinatura é obrigatória."),
});

export type AuthorizationTermData = z.infer<typeof authorizationTermSchema>;

export const permutationObjectTypes = ['Equipamentos', 'Serviços', 'Espaços', 'Alimentos'] as const;
export type PermutationObjectType = (typeof permutationObjectTypes)[number];

export const permutationContractSchema = z.object({
  permutants: z.array(contractorSchema).min(1, "Adicione pelo menos um permutante."),
  permutantObjectType: z.enum(permutationObjectTypes),
  permutantObject: z.string().min(1, "Descreva o objeto do PERMUTANTE."),
  permutantObjectValue: z.number().positive("O valor avaliado deve ser maior que zero."),
  permutedObject: z.string().min(1, "Descreva os serviços a serem prestados pelo PERMUTADO."),
  conditionType: z.enum(['Com prazo', 'Sem prazo']),
  conditionDeadline: z.string().optional(),
  conditions: z.string().min(1, "As condições são obrigatórias."),
  propertyTransfer: z.string().min(1, "A cláusula de transferência é obrigatória."),
  generalDispositions: z.string().optional(),
  jurisdiction: z.string().min(1, "Foro é obrigatório."),
  signatureCity: z.string().min(1, "Cidade da assinatura é obrigatória."),
  signatureDate: z.string().min(1, "Data da assinatura é obrigatória."),
});

export type PermutationContractData = z.infer<typeof permutationContractSchema>;


export const companyData = {
    name: "FastFilms",
    cnpj: "53.525.841/0001-89",
    address: "Rua Bartolomeu Bueno de Gusmao, 594 - Aeronautas, Lagoa Santa - MG, 33.236-454",
    email: "fastfilmsoficial@gmail.com",
    logoUrl: "https://raw.githubusercontent.com/Lyd09/of/refs/heads/main/logoFF-F-Transparente.png"
}
