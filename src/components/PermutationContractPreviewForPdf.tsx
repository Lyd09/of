
"use client";

import React from 'react';
import { PermutationContractData, companyData } from '@/types/contract';
import numero from 'numero-por-extenso';
import { boldenContractTerms } from '@/lib/contract-utils';

interface PermutationContractPreviewProps {
  data: PermutationContractData;
}

const termsToBold = ["PERMUTANTE", "PERMUTANTES", "PERMUTADO"];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

const Clause: React.FC<{ title: string; number: number; children: React.ReactNode }> = ({ title, number, children }) => (
  <div className="mb-4 no-break">
    <p>
      <strong>{`Cláusula ${number} – `}</strong>
      <strong>{title.toUpperCase()}</strong>
    </p>
    <div className="text-justify whitespace-pre-wrap">{children}</div>
  </div>
);

export function PermutationContractPreviewForPdf({ data }: PermutationContractPreviewProps) {
  const {
    permutants,
    permutantObject,
    permutantObjectValue,
    permutedObject,
    conditions,
    propertyTransfer,
    jurisdiction,
    signatureCity,
    signatureDate,
  } = data || {};

  const getObjectText = () => {
      const valueFormatted = formatCurrency(permutantObjectValue || 0);
      const valueInWords = numero.porExtenso(permutantObjectValue || 0, numero.estilo.monetario);
      const text = `O presente contrato tem como objeto a permuta de ${permutantObject || '[descreva o bem/serviço do PERMUTANTE]'}, de propriedade do(s) PERMUTANTE(S), avaliada em ${valueFormatted} (${valueInWords}), pelo serviço de ${permutedObject || '[descreva o bem/serviço do PERMUTADO]'} a ser prestado pelo PERMUTADO.`;
      return boldenContractTerms(text, termsToBold);
  }

  const getForoText = () => {
    const text = `Fica eleito o foro da comarca de ${jurisdiction || 'Cidade/UF'} para dirimir quaisquer controvérsias oriundas do presente contrato.`;
    return boldenContractTerms(text, termsToBold);
   };

  return (
    <div className="bg-white text-black p-12" style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: '12pt', lineHeight: '1.5', width: '210mm', minHeight: '297mm' }}>
      <h1 className="text-center font-bold text-lg mb-8">CONTRATO DE PERMUTA</h1>

      <div className="mb-6 space-y-4 no-break">
        <div>
            <p><strong className="font-bold">PERMUTADO:</strong></p>
            <p className="text-justify">
                <strong>NOME:</strong> {companyData.name}, pessoa jurídica de direito privado, inscrita no <strong>CNPJ</strong> sob o nº {companyData.cnpj}, com sede em <strong>ENDEREÇO:</strong> {companyData.address}, e <strong>E-MAIL:</strong> {companyData.email}.
            </p>
        </div>
        
        <p className="font-bold text-justify">e de outro lado:</p>

        <div>
            <p><strong className="font-bold">{permutants?.length > 1 ? 'PERMUTANTES:' : 'PERMUTANTE:'}</strong></p>
            {permutants?.map((p, i) => (
                <p key={p.id || i} className="text-justify mb-2">
                    <strong>NOME:</strong> {p.name || `Nome do Permutante ${i+1}`}, inscrito(a) no <strong>CPF/CNPJ</strong> sob o nº {p.cpfCnpj || '000.000.000-00'}, residente e domiciliado(a) em <strong>ENDEREÇO:</strong> {p.address || 'Endereço do Permutante'}, e <strong>E-MAIL:</strong> {p.email || 'email@permutante.com'}.
                </p>
            ))}
        </div>
        <p className="text-justify">Resolvem, de comum acordo, celebrar o presente contrato de permuta, que se regerá pelas seguintes cláusulas e condições:</p>
      </div>
      
      <Clause title="Objeto" number={1}>
        <p>{getObjectText()}</p>
      </Clause>

      <Clause title="Das Condições" number={2}>
        <p>{boldenContractTerms(conditions || '', termsToBold)}</p>
      </Clause>
      
      <Clause title="Da Transferência de Propriedade" number={3}>
        <p>{boldenContractTerms(propertyTransfer || '', termsToBold)}</p>
      </Clause>
      
      <Clause title="Do Foro" number={4}>
         <p>{getForoText()}</p>
       </Clause>

      <div className="mt-16 text-center no-break">
        <p>{signatureCity || 'Cidade'}, {signatureDate || 'Data'}.</p>
      </div>

       <div className="mt-16 space-y-8 no-break">
        <div className="text-center">
            <p>_________________________________________</p>
            <p>{companyData.name} (<strong>PERMUTADO</strong>)</p>
        </div>
        {permutants?.map((p, i) => (
            <div key={p.id || i} className="text-center">
                <p>_________________________________________</p>
                <p>{p.name || 'Nome do Permutante'} (<strong>PERMUTANTE</strong>)</p>
            </div>
        ))}
      </div>

    </div>
  );
}
