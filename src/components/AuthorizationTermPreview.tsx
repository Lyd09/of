
"use client";

import React from 'react';
import { AuthorizationTermData, companyData } from '@/types/contract';
import numero from 'numero-por-extenso';
import Image from 'next/image';

interface AuthorizationTermPreviewProps {
  data: AuthorizationTermData;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const Clause: React.FC<{ title: string; number: number; children: React.ReactNode }> = ({ title, number, children }) => (
  <div className="mb-4">
    <p>
      <strong>{`Cláusula ${number} – `}</strong>
      <strong>{title.toUpperCase()}</strong>
    </p>
    <div className="text-justify whitespace-pre-wrap">{children}</div>
  </div>
);

export function AuthorizationTermPreview({ data }: AuthorizationTermPreviewProps) {
  const {
    authorizedName,
    authorizedCpfCnpj,
    authorizedAddress,
    authorizedEmail,
    projectName,
    finalClient,
    executionDate,
    authorizedLinks,
    permissionsAndProhibitions,
    fineValue,
    generalDispositions,
    jurisdiction,
    signatureCity,
    signatureDate,
  } = data || {};

  let clauseNumber = 1;

  const renderTextWithBold = (text?: string) => {
      if (!text) return null;
      const termsToBold = ["AUTORIZANTE", "AUTORIZADO\\(A\\)"];
      const regex = new RegExp(`(${termsToBold.join('|')})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, index) => {
          const isTerm = termsToBold.some(term => new RegExp(`^${term}$`, 'i').test(part.replace('(A)', '(a)')));
          if (isTerm) {
              return <strong key={index}>{part}</strong>;
          }
          return part;
      });
  }

  return (
    <div className="bg-white text-black p-12 shadow-lg" style={{ fontFamily: "'Geist Sans', sans-serif" }}>
      <header className="flex justify-between items-center mb-8">
        {companyData.logoUrl && <Image src={companyData.logoUrl} alt="Logo da Empresa" width={100} height={100} />}
        <h1 className="text-center font-bold text-lg">TERMO DE AUTORIZAÇÃO DE USO DE MATERIAL</h1>
      </header>

      <div className="mb-6 space-y-4">
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
      
      <Clause title="Objeto" number={clauseNumber++}>
        <p>Este termo trata da autorização exclusiva e pontual para o uso de material audiovisual captado pelo <strong>AUTORIZADO(A)</strong> no projeto abaixo identificado:</p>
        <ul className="list-disc list-inside my-2 ml-4">
            <li><strong>Projeto:</strong> {projectName || 'Nome do Projeto'}</li>
            <li><strong>Cliente final:</strong> {finalClient || 'Cliente Final'}</li>
            <li><strong>Data de execução:</strong> {executionDate || 'dd/mm/aaaa'}</li>
            <li><strong>Link(s) autorizado(s):</strong> <a href={authorizedLinks} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">{authorizedLinks || 'Link do material'}</a></li>
        </ul>
      </Clause>

      <Clause title="Permissões e Vedações" number={clauseNumber++}>
        {renderTextWithBold(permissionsAndProhibitions)}
      </Clause>

      <Clause title="Penalidade" number={clauseNumber++}>
         <p>
            O descumprimento de qualquer uma das condições estabelecidas neste termo, especialmente as vedações da Cláusula 2ª, sujeitará o <strong>AUTORIZADO(A)</strong> ao pagamento de uma multa no valor de <strong>{formatCurrency(fineValue || 0)} ({numero.porExtenso(fineValue || 0, numero.estilo.monetario)})</strong>, sem prejuízo da imediata remoção do material e de eventuais perdas e danos.
         </p>
       </Clause>

      {generalDispositions && (
        <Clause title="Disposições Gerais" number={clauseNumber++}>
          {renderTextWithBold(generalDispositions)}
        </Clause>
      )}
      
       <Clause title="Foro" number={clauseNumber++}>
         <p>
            Fica eleito o foro da comarca de <strong>{jurisdiction || 'Cidade/UF'}</strong> para dirimir quaisquer controvérsias oriundas do presente termo.
         </p>
       </Clause>

      <div className="mt-16 text-center">
        <p>{signatureCity || 'Cidade'}, {signatureDate || 'Data'}.</p>
      </div>

       <div className="mt-16 space-y-8">
        <div className="text-center">
            <p>_________________________________________</p>
            <p>{companyData.name} (<strong>Autorizante</strong>)</p>
        </div>
        <div className="text-center">
            <p>_________________________________________</p>
            <p>{authorizedName || 'Nome do Autorizado'} (<strong>Autorizado(a)</strong>)</p>
        </div>
      </div>

    </div>
  );
}

    