"use client";

import React from 'react';
import { AuthorizationTermData, companyData } from '@/types/contract';
import numero from 'numero-por-extenso';

interface AuthorizationTermPreviewProps {
  data: AuthorizationTermData;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const Clause: React.FC<{ title: string; number: number; children: React.ReactNode }> = ({ title, number, children }) => (
  <div className="mb-4 no-break">
    <p>
      <strong>{`Cláusula ${number} – `}</strong>
      <strong>{title.toUpperCase()}</strong>
    </p>
    <div className="text-justify">{children}</div>
  </div>
);

export function AuthorizationTermPreviewForPdf({ data }: AuthorizationTermPreviewProps) {
  const {
    authorizedName,
    authorizedCpfCnpj,
    authorizedAddress,
    authorizedEmail,
    projectName,
    finalClient,
    executionDate,
    authorizedLinks,
    fineValue,
    jurisdiction,
    signatureCity,
    signatureDate,
  } = data || {};

  return (
    <div className="bg-white text-black p-12" style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: '12pt', lineHeight: '1.5', width: '210mm', minHeight: '297mm' }}>
      <h1 className="text-center font-bold text-lg mb-8">TERMO DE AUTORIZAÇÃO DE USO DE MATERIAL</h1>

      <div className="mb-6 space-y-4 no-break">
        <div>
            <p><strong className="font-bold">AUTORIZANTE:</strong></p>
            <p className="text-justify">
                <strong>NOME:</strong> {companyData.name}, pessoa jurídica de direito privado, inscrita no <strong>CNPJ</strong> sob o nº {companyData.cnpj}, com sede em <strong>ENDEREÇO:</strong> {companyData.address}, e <strong>E-MAIL:</strong> {companyData.email}.
            </p>
        </div>
        
        <p className="font-bold text-justify">e de outro lado:</p>

        <div>
            <p><strong className="font-bold">AUTORIZADO(A):</strong></p>
             <p className="text-justify">
                <strong>NOME:</strong> {authorizedName || 'Nome do Autorizado'}, inscrito(a) no <strong>CPF/CNPJ</strong> sob o nº {authorizedCpfCnpj || '000.000.000-00'}, residente e domiciliado(a) em <strong>ENDEREÇO:</strong> {authorizedAddress || 'Endereço do Autorizado'}, e <strong>E-MAIL:</strong> {authorizedEmail || 'email@autorizado.com'}.
            </p>
        </div>
      </div>
      
      <Clause title="Objeto" number={1}>
        <p>Este termo trata da autorização exclusiva e pontual para o uso de material audiovisual captado pelo AUTORIZADO(A) no projeto abaixo identificado:</p>
        <ul className="list-disc list-inside my-2 ml-4">
            <li><strong>Projeto:</strong> {projectName || 'Nome do Projeto'}</li>
            <li><strong>Cliente final:</strong> {finalClient || 'Cliente Final'}</li>
            <li><strong>Data de execução:</strong> {executionDate || 'dd/mm/aaaa'}</li>
            <li><strong>Link(s) autorizado(s):</strong> {authorizedLinks || 'Link do material'}</li>
        </ul>
      </Clause>

      <Clause title="Permissões e Vedações" number={2}>
        <p>
            O AUTORIZADO(A) poderá utilizar o material descrito na Cláusula 1ª exclusivamente para compor seu portfólio pessoal em sites, redes sociais de cunho profissional (como LinkedIn e Vimeo) e apresentações diretas a potenciais clientes.
        </p>
        <p className="mt-2">
            É expressamente vedado ao AUTORIZADO(A):
        </p>
        <ul className="list-disc list-inside my-2 ml-4">
            <li>Monetizar o material, no todo ou em parte, através de plataformas de vídeo, publicidade ou qualquer outro meio;</li>
            <li>Utilizar trechos que contenham a imagem de pessoas identificáveis, caso estas não tenham cedido seus direitos de imagem para este fim específico;</li>
            <li>Realizar edições, cortes ou alterações que distorçam o sentido original da obra, a mensagem do cliente final ou a marca da AUTORIZANTE;</li>
            <li>Omitir o crédito. É obrigatório que, em toda e qualquer veiculação, o AUTORIZADO(A) atribua o crédito de produção à <strong>{companyData.name}</strong>, não podendo, em nenhuma hipótese, sugerir que o projeto foi uma realização integralmente sua.</li>
        </ul>
      </Clause>

      <Clause title="Penalidade" number={3}>
         <p>
            O descumprimento de qualquer uma das condições estabelecidas neste termo, especialmente as vedações da Cláusula 2ª, sujeitará o AUTORIZADO(A) ao pagamento de uma multa no valor de <strong>{formatCurrency(fineValue || 0)} ({numero.porExtenso(fineValue || 0, numero.estilo.monetario)})</strong>, sem prejuízo da imediata remoção do material e de eventuais perdas e danos.
         </p>
       </Clause>
      
       <Clause title="Foro" number={4}>
         <p>
            Fica eleito o foro da comarca de <strong>{jurisdiction || 'Cidade/UF'}</strong> para dirimir quaisquer controvérsias oriundas do presente termo.
         </p>
       </Clause>

      <div className="mt-16 text-center no-break">
        <p>{signatureCity || 'Cidade'}, {signatureDate || 'Data'}.</p>
      </div>

       <div className="mt-16 space-y-8 no-break">
        <div className="text-center">
            <p>_________________________________________</p>
            <p>{companyData.name} (Autorizante)</p>
        </div>
        <div className="text-center">
            <p>_________________________________________</p>
            <p>{authorizedName || 'Nome do Autorizado'} (Autorizado(a))</p>
        </div>
      </div>

    </div>
  );
}
